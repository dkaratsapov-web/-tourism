"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { storyProgress } from "@/components/story/progress";

/** Часть истории, на которую приходится полёт (доли общего прогресса 0…1). */
const FLIGHT_FROM = 0.18;
const FLIGHT_TO = 0.55;

/** Мягкая «пушинка» облака: радиальный градиент на канвасе, без внешних текстур. */
function usePuffTexture(soft: boolean) {
  return useMemo(() => {
    const size = 128;
    const c = document.createElement("canvas");
    c.width = c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, soft ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,1)");
    grad.addColorStop(soft ? 0.25 : 0.4, soft ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.7)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [soft]);
}

type Puff = { x: number; y: number; z: number; s: number; o: number; c: THREE.Color };

/** Детерминированный генератор, чтобы облака не «прыгали» между рендерами. */
function seeded(seed: number) {
  let t = seed;
  return () => {
    t = (t * 1664525 + 1013904223) % 4294967296;
    return t / 4294967296;
  };
}

// Цвета облаков из палитры: свет — белый, тень — небесно-голубой с чернилами.
const LIGHT = new THREE.Color("#ffffff");
const SHADE = new THREE.Color("#a9cdeb").lerp(new THREE.Color("#13294b"), 0.12);

function Clouds({ count }: { count: number }) {
  const tex = usePuffTexture(false);
  const soft = usePuffTexture(true);
  const group = useRef<THREE.Group>(null);

  const puffs = useMemo<Puff[]>(() => {
    const rnd = seeded(11);
    return Array.from({ length: count }, (_, i) => {
      // Коридор вдоль пути камеры, середина свободна; в конце — плотная стена для уайт-аута.
      const wall = i > count * 0.82;
      const side = rnd() > 0.5 ? 1 : -1;
      const shade = rnd();
      return {
        x: wall ? (rnd() - 0.5) * 14 : side * (1.8 + rnd() * 10),
        y: wall ? (rnd() - 0.5) * 6 : -4 + rnd() * 5.5,
        z: wall ? -104 - rnd() * 14 : -rnd() * 100,
        s: wall ? 9 + rnd() * 8 : 4 + rnd() * 10,
        o: wall ? 0.75 : 0.3 + rnd() * 0.55,
        c: SHADE.clone().lerp(LIGHT, 0.45 + shade * 0.55),
      };
    });
  }, [count]);

  useFrame(({ camera }, dt) => {
    const f = Math.min(1, Math.max(0, (storyProgress.value - FLIGHT_FROM) / (FLIGHT_TO - FLIGHT_FROM)));
    // Камера летит вперёд сквозь облака, слегка набирает высоту, самолёт чуть кренится.
    const targetZ = 6 - f * 112;
    const targetY = 0.3 + Math.sin(f * Math.PI) * 1.4;
    const k = Math.min(1, dt * 3.2);
    camera.position.z += (targetZ - camera.position.z) * k;
    camera.position.y += (targetY - camera.position.y) * k;
    camera.rotation.z = Math.sin(f * Math.PI * 2) * 0.035;
    // Единственная фоновая петля сцены: облака медленно дрейфуют (останавливается вне экрана вместе с кадрами).
    if (group.current) group.current.position.x = Math.sin(performance.now() / 7000) * 0.5;
  });

  return (
    <group ref={group}>
      {puffs.map((p, i) => (
        <sprite key={i} position={[p.x, p.y, p.z]} scale={[p.s, p.s * 0.6, 1]}>
          <spriteMaterial map={i % 3 ? tex : soft} color={p.c} transparent opacity={p.o} depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

/** Солнце — мягкое пятно сбоку, неподвижно относительно камеры. */
function Sun() {
  const ref = useRef<THREE.Sprite>(null);
  const tex = usePuffTexture(true);
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.set(camera.position.x + 9, camera.position.y + 5, camera.position.z - 30);
  });
  return (
    <sprite ref={ref} scale={[26, 26, 1]}>
      <spriteMaterial map={tex} color="#fff6e6" transparent opacity={0.9} depthWrite={false} fog={false} />
    </sprite>
  );
}

/** 3D-сцена полёта. Подключается лениво и только без «уменьшить движение». */
export default function CloudFlight({ active }: { active: boolean }) {
  // Компонент грузится только в браузере (ssr: false), поэтому window доступен сразу.
  const [mobile] = useState(() => window.matchMedia("(max-width: 899px)").matches);
  return (
    <Canvas
      dpr={mobile ? [1, 1.25] : [1, 1.5]}
      frameloop={active ? "always" : "never"}
      camera={{ fov: mobile ? 62 : 55, position: [0, 0.3, 6], near: 0.1, far: 140 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
      style={{ position: "absolute", inset: 0 }}
    >
      <fog attach="fog" args={["#d9e8f5", 18, 90]} />
      <Sun />
      <Clouds count={mobile ? 60 : 140} />
    </Canvas>
  );
}
