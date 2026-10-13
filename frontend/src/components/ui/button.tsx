import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type Variante = "primary" | "secondary" | "ghost" | "danger";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
}

const ESTILOS: Record<Variante, string> = {
  primary: "bg-primary text-on-primary hover:brightness-110",
  secondary:
    "border border-primary text-primary bg-transparent hover:bg-primary-container",
  ghost: "text-on-surface hover:bg-surface-container",
  danger: "bg-danger text-on-danger hover:brightness-110",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variante = "primary", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex h-11 min-h-[44px] items-center justify-center gap-2 rounded-lg px-5 text-base font-semibold transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          ESTILOS[variante],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
