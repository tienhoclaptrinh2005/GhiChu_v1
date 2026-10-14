import { BlockRenderer } from "@/components/public/block-renderer";
import { ProfileHero } from "@/components/public/profile-hero";
import { getPublishedNotes } from "@/features/notes/queries";
import { getHomeBlocks, getSiteSettings } from "@/features/site/queries";

export default async function HomePage() {
  const [settings, blocks, notes] = await Promise.all([
    getSiteSettings(),
    getHomeBlocks(),
    getPublishedNotes(6),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <ProfileHero settings={settings} />
      <div id="noi-dung" className="mx-auto mt-6 max-w-4xl space-y-6 scroll-mt-24 sm:mt-8">
        {blocks.map((block) => (
          <BlockRenderer key={block.id} block={block} notes={notes} />
        ))}
      </div>
    </main>
  );
}
