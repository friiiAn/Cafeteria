import { NavLink } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface BottomBarItem {
  ruta: string;
  etiqueta: string;
  end?: boolean;
  badge?: number;
}

export function BottomBar({ items }: { items: BottomBarItem[] }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-outline-variant bg-surface-container-lowest lg:hidden">
      {items.map((item) => (
        <NavLink
          key={item.ruta}
          to={item.ruta}
          end={item.end}
          className={({ isActive }) =>
            cn(
              "relative flex min-h-[56px] flex-1 flex-col items-center justify-center px-2 text-xs font-medium",
              isActive ? "text-primary" : "text-on-surface-variant",
            )
          }
        >
          <span>{item.etiqueta}</span>
          {item.badge ? (
            <span className="absolute top-1.5 right-1/4 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] font-bold text-on-danger">
              {item.badge}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  );
}
