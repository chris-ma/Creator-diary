import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-paper hover:bg-ink-light disabled:opacity-50",
  secondary:
    "border border-ink/30 text-ink hover:border-ink/60 disabled:opacity-50",
  ghost:
    "text-ink-muted hover:text-ink disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:opacity-50",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-xs",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    { variant = "primary", size = "md", className = "", children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        {...props}
        className={`inline-flex items-center justify-center tracking-widest uppercase font-normal transition-colors focus:outline-none ${variants[variant]} ${sizes[size]} ${className}`}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
