"use client";

import { useEffect, useRef } from "react";

const BLOCK_TONES = ["grass", "sky", "sun", "dirt"] as const;
const BLOCK_COUNT = 14;

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function renderBlocks(host: HTMLDivElement, reducedMotion: MediaQueryList) {
  host.replaceChildren();
  if (reducedMotion.matches) return;

  const fragment = document.createDocumentFragment();

  for (let index = 0; index < BLOCK_COUNT; index += 1) {
    const block = document.createElement("span");
    const duration = randomBetween(9, 17);
    const size = Math.round(randomBetween(5, 10)) * 2;
    const spin = Math.round(randomBetween(-3, 3)) * 90;

    block.className = `falling-voxel-block falling-voxel-block--${BLOCK_TONES[index % BLOCK_TONES.length]}`;
    block.style.setProperty("--voxel-left", `${randomBetween(1, 97).toFixed(2)}vw`);
    block.style.setProperty("--voxel-size", `${size}px`);
    block.style.setProperty("--voxel-duration", `${duration.toFixed(2)}s`);
    block.style.setProperty("--voxel-delay", `${(-randomBetween(0, duration)).toFixed(2)}s`);
    block.style.setProperty("--voxel-drift", `${randomBetween(-72, 72).toFixed(1)}px`);
    block.style.setProperty("--voxel-spin", `${spin}deg`);
    block.style.setProperty("--voxel-opacity", randomBetween(0.2, 0.42).toFixed(2));
    fragment.appendChild(block);
  }

  host.appendChild(fragment);
}

export function FallingVoxelBlocks() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => renderBlocks(host, reducedMotion);

    update();
    reducedMotion.addEventListener("change", update);

    return () => {
      reducedMotion.removeEventListener("change", update);
      host.replaceChildren();
    };
  }, []);

  return <div ref={hostRef} className="falling-voxel-field" aria-hidden="true" />;
}
