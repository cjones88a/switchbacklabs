"use client";
import { forwardRef, ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

const sizeCls = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-5" };

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant="primary", size="md", ...props }, ref) => {
    const base = "btn rounded-xl";
    const v = {
      primary: "btn-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]",
      secondary: "border bg-[hsl(var(--surface))] border hover:bg-[hsl(var(--surface))/0.9]",
      ghost: "border hover:bg-[hsl(var(--surface))/0.6]",
    }[variant];
    return <button ref={ref} className={clsx(base, v, sizeCls[size], className)} {...props} />;
  }
);
Button.displayName = "Button";