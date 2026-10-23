import { BlockRenderer } from "@/components/public/block-renderer";
import { ProfileHero } from "@/components/public/profile-hero";
import { getPinnedPublishedNotes } from "@/features/notes/queries";
import { getHomeBlocks, getSiteSettings } from "@/features/site/queries";

export default async function HomePage() {
  const [settings, blocks, notes] = await Promise.all([
    getSiteSettings(),
    getHomeBlocks(),
    getPinnedPublishedNotes(4),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-7 sm:px-6 sm:py-12">
      <ProfileHero settings={settings} />
      <div id="noi-dung" className="mt-8 space-y-8 scroll-mt-24 sm:mt-10 sm:space-y-10">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} notes={notes} />
        ))}
      </div>
    </main>
  );
}
