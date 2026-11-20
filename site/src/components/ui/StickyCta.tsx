"use client";

import { useEffect, useState } from "react";
import { CtaButton } from "./CtaButton";

/** Кнопка заявки, которая появляется после первого экрана и прячется у блока заявки. */
export function StickyCta() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const lead = document.getElementById("lead");
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.8;
      const atLead = lead ? lead.getBoundingClientRect().top < window.innerHeight * 0.6 : false;
      setShow(pastHero && !atLead);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] md:bottom-8 md:right-8 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <CtaButton className="shadow-[0_20px_40px_-15px_rgba(10,30,60,.5)]" />
    </div>
  );
}
