"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { storyProgress } from "@/components/story/progress";

/** Мягкая «пушинка» облака: радиальный градиент на канвасе, без внешних текстур. */
function usePuffTexture() {
  return useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, "rgba(255,255,255,0.95)");
    grad.addColorStop(0.45, "rgba(255,255,255,0.55)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

type Puff = { x: number; y: number; z: number; s: number; o: number };

/** Детерминированный генератор, чтобы облака не «прыгали» между рендерами. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1664525 + 1013904223) % 4294967296;
    return t / 4294967296;
  };
}

function Clouds({ count }: { count: number }) {
  const tex = usePuffTexture();
  const group = useRef<THREE.Group>(null);

  const puffs = useMemo<Puff[]>(() => {
    const rnd = seeded(7);
    return Array.from({ length: count }, () => {
      // Облака стоят «коридором» вдоль пути камеры, середина остаётся свободной.
      const side = rnd() > 0.5 ? 1 : -1;
      return {
        x: side * (2.2 + rnd() * 9),
        y: -3.5 + rnd() * 5,
        z: -rnd() * 120,
        s: 4 + rnd() * 9,
        o: 0.35 + rnd() * 0.5,
      };
    });
  }, [count]);

  useFrame(({ camera }, dt) => {
    const p = storyProgress.value;
    // Камера летит вперёд сквозь облака; к концу истории поднимается над слоем.
    const targetZ = 6 - p * 118;
    const targetY = 0.4 + Math.max(0, p - 0.7) * 10;
    camera.position.z += (targetZ - camera.position.z) * Math.min(1, dt * 3);
    camera.position.y += (targetY - camera.position.y) * Math.min(1, dt * 3);
    camera.rotation.z = Math.sin(p * Math.PI * 2) * 0.03; // лёгкий крен самолёта
    if (group.current) group.current.position.x = Math.sin(performance.now() / 6000) * 0.4;
  });

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.s, p.s * 0.62, 1]}>
          <spriteMaterial map={tex} transparent opacity={p.o} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

/** 3D-сцена полёта. Подключается лениво и только без «уменьшить движение». */
export default function CloudFlight({ active }: { active: boolean }) {
  // Компонент грузится только в браузере (ssr: false), поэтому window доступен сразу.
  const [mobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: 55, position: [0, 0.4, 6], near: 0.1, far: 140 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <fog attach="fog" args={["#cfe3f5", 20, 95]} />
      <Clouds count={mobile ? 45 : 100} />
    </Canvas>
  );
}
