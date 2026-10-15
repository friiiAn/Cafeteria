import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  activo?: boolean;
}

export function Chip({ activo = false, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={activo}
      className={cn(
        "inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium whitespace-nowrap transition",
        activo
          ? "border-primary bg-primary text-on-primary"
          : "border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container",
        className,
      )}
      {...props}
    />
  );
}
