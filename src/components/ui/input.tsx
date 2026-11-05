import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full rounded-[5px] border border-ink/25 bg-white px-4 text-base text-ink outline-none transition-colors placeholder:text-mist focus-visible:border-bolt focus-visible:ring-1 focus-visible:ring-bolt disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
