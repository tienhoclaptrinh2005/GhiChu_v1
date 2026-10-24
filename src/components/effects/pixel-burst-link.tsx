"use client";

import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type PixelBurstLinkProps = {
  href: string;
  external?: boolean;
  newTab?: boolean;
  className?: string;
  children: ReactNode;
};

const PARTICLE_TONES = ["sun", "sky", "grass", "dirt"] as const;

function createPixelBurst(event: MouseEvent<HTMLAnchorElement>) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const keyboardActivation = event.clientX === 0 && event.clientY === 0;
  const originX = keyboardActivation ? rect.left + rect.width / 2 : event.clientX;
  const originY = keyboardActivation ? rect.top + rect.height / 2 : event.clientY;
  const particleCount = 4 + Math.floor(Math.random() * 3);

  for (let index = 0; index < particleCount; index += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / particleCount + (Math.random() - 0.5) * 0.45;
    const distance = 24 + Math.random() * 24;
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance - 8;
    const size = 5 + Math.floor(Math.random() * 4);
    const rotation = (Math.floor(Math.random() * 5) - 2) * 90;

    particle.className = `pixel-burst-particle pixel-burst-particle--${PARTICLE_TONES[index % PARTICLE_TONES.length]}`;
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.setProperty("--burst-x", `${offsetX.toFixed(1)}px`);
    particle.style.setProperty("--burst-y", `${offsetY.toFixed(1)}px`);
    particle.style.setProperty("--burst-fall-y", `${(offsetY + 14).toFixed(1)}px`);
    particle.style.setProperty("--burst-size", `${size}px`);
    particle.style.setProperty("--burst-rotation", `${rotation}deg`);
    document.body.appendChild(particle);

    const removeParticle = () => particle.remove();
    const fallbackTimer = window.setTimeout(removeParticle, 800);
    particle.addEventListener(
      "animationend",
      () => {
        window.clearTimeout(fallbackTimer);
        removeParticle();
      },
      { once: true },
    );
  }
}

export function PixelBurstLink({
  href,
  external = false,
  newTab = false,
  className,
  children,
}: PixelBurstLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer" : undefined}
        className={className}
        onClick={createPixelBurst}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={createPixelBurst}>
      {children}
    </Link>
  );
}
