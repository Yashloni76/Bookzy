import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-blue-700 text-white hover:bg-blue-800 disabled:opacity-70",
      secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
      ghost: "bg-transparent text-blue-700 hover:bg-blue-50",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex h-11 items-center justify-center rounded-lg px-5 text-sm font-semibold transition-colors focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
