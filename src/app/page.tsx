import { Drops } from "@/components/drops";
import { Favourite } from "@/components/favourite";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { LiveFloor } from "@/components/live-floor";
import { PackGrid } from "@/components/pack-grid";
import { PackRip } from "@/components/pack-rip";
import { Slab } from "@/components/slab";
import { Waitlist } from "@/components/waitlist";

export default function Home() {
  return (
    <main id="main" className="site-content">
      <Hero />
      <section className="bg-stage">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-16">
          <PackGrid />
          <LiveFloor />
        </div>
      </section>
      <PackRip />
      <Slab />
      <Gallery />
      <Favourite />
      <Drops />
      <Waitlist />
    </main>
  );
}
