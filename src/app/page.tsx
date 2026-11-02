import { Drops } from "@/components/drops";
import { Favourite } from "@/components/favourite";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { LiveFloor } from "@/components/live-floor";
import { PackRip } from "@/components/pack-rip";
import { Waitlist } from "@/components/waitlist";

export default function Home() {
  return (
    <main id="main">
      <Hero />
      <LiveFloor />
      <PackRip />
      <Gallery />
      <Favourite />
      <Drops />
      <Waitlist />
    </main>
  );
}
