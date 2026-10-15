import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PedidoCocinaCard } from "./PedidoCocinaCard";
import type { PedidoCocina } from "../types";

const base: PedidoCocina = {
  id: 47,
  numero: "A-1024",
  tipo: "anticipado",
  estado: "Pagado",
  cliente_nombre: "Marta López",
  creado_en: "2026-10-14T11:05:00",
  fecha_recoleccion: "2026-10-14T11:30:00",
  items: [{ cantidad: 2, nombre: "Café americano" }],
};

const AHORA = new Date("2026-10-14T11:10:00").getTime();

describe("PedidoCocinaCard", () => {
  it("muestra folio, número, cliente y partidas", () => {
    render(<PedidoCocinaCard pedido={base} ahora={AHORA} />);
    expect(screen.getByText("#47")).toBeInTheDocument();
    expect(screen.getByText("A-1024")).toBeInTheDocument();
    expect(screen.getByText(/Marta López/)).toBeInTheDocument();
    expect(screen.getByText("Café americano")).toBeInTheDocument();
  });

  it("muestra el CTA 'Iniciar preparación' cuando está Pagado", () => {
    const onAvanzar = vi.fn();
    render(
      <PedidoCocinaCard pedido={base} ahora={AHORA} onAvanzar={onAvanzar} />,
    );
    const boton = screen.getByRole("button", { name: /iniciar preparación/i });
    fireEvent.click(boton);
    expect(onAvanzar).toHaveBeenCalledWith(base);
  });

  it("muestra 'Marcar listo' cuando está En preparación", () => {
    render(
      <PedidoCocinaCard
        pedido={{ ...base, estado: "En preparación" }}
        ahora={AHORA}
      />,
    );
    expect(
      screen.getByRole("button", { name: /marcar listo/i }),
    ).toBeInTheDocument();
  });

  it("no muestra CTA y avisa 'en espera de caja' cuando está Listo", () => {
    render(
      <PedidoCocinaCard pedido={{ ...base, estado: "Listo" }} ahora={AHORA} />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText(/en espera de caja/i)).toBeInTheDocument();
  });

  it("marca ¡Retrasado! cuando la hora de recolección ya pasó", () => {
    const despues = new Date("2026-10-14T12:00:00").getTime();
    render(<PedidoCocinaCard pedido={base} ahora={despues} />);
    expect(screen.getByText(/¡Retrasado!/)).toBeInTheDocument();
  });

  it("deshabilita el CTA mientras está ocupado", () => {
    render(<PedidoCocinaCard pedido={base} ahora={AHORA} ocupado />);
    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
  });
});
