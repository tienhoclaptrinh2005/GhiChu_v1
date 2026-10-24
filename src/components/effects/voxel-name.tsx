import type { CSSProperties } from "react";

export function VoxelName({ name }: { name: string }) {
  let pieceIndex = 0;
  const words = name.trim().split(/\s+/);

  return (
    <h1
      className="voxel-title min-w-0 text-balance text-2xl leading-[1.18] sm:text-4xl"
      aria-label={name}
    >
      <span className="voxel-name-assembly" aria-hidden="true">
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} className="voxel-name-word">
            {Array.from(word).map((character, characterIndex) => {
              const currentIndex = pieceIndex;
              pieceIndex += 1;

              return (
                <span
                  key={`${character}-${characterIndex}`}
                  className="voxel-name-piece"
                  style={
                    { "--voxel-piece-delay": `${80 + currentIndex * 38}ms` } as CSSProperties
                  }
                >
                  {character}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </h1>
  );
}
