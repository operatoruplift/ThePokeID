import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold uppercase tracking-[0.14em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bolt disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4",
  {
    variants: {
      variant: {
        lip: "lip bg-brand text-white [--lip:var(--brand-deep)]",
        sun: "lip bg-sun text-ink [--lip:#c9a400]",
        outline:
          "border-2 border-white/30 bg-transparent text-paper hover:bg-paper hover:text-ink",
        ghost: "bg-transparent text-inherit hover:bg-ink/5",
        inverse: "lip bg-paper text-ink [--lip:#d9cfc6]",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-10 px-3.5 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "lip",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
