import { FallingVoxelBlocks } from "@/components/effects/falling-voxel-blocks";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen">
      <FallingVoxelBlocks />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
