import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="grid min-h-[70vh] place-items-center bg-paper px-5 py-32 text-center">
      <div>
        <Image
          src="/brand/logo.webp"
          alt=""
          width={180}
          height={180}
          className="mx-auto size-36"
        />
        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight">
          That page isn&apos;t in the binder.
        </h1>
        <p className="mt-3 text-mist">The desk you want is back on the floor.</p>
        <Button asChild className="mt-6">
          <Link href="/">Back to the desk</Link>
        </Button>
      </div>
    </main>
  );
}
