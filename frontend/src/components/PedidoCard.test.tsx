import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PedidoCard } from "./PedidoCard";
import type { PedidoDetalle, PedidoResumen } from "../types";

const BASE: PedidoResumen = {
  id: 7,
  numero: "#007",
  estado: "Listo",
  total: 50,
  fecha_recoleccion: "2026-10-14T12:30:00",
  creado_en: "2026-10-14T12:00:00",
};

const DETALLE: PedidoDetalle = {
  ...BASE,
  tipo: "anticipado",
  items: [
    {
      menu_dia_id: 1,
      nombre: "Café americano",
      cantidad: 2,
      precio_unitario: 25,
      subtotal: 50,
    },
  ],
  historial: [
    { estado_anterior: null, estado_nuevo: "Pendiente", fecha: "2026-10-14T12:00:00" },
    { estado_anterior: "Pagado", estado_nuevo: "Listo", fecha: "2026-10-14T12:20:00" },
  ],
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PedidoCard", () => {
  it("destaca un pedido Listo con el aviso de recogida", () => {
    render(<PedidoCard pedido={BASE} onPagar={vi.fn()} />);
    expect(screen.getByText("¡Listo para recoger!")).toBeInTheDocument();
    expect(screen.getByText("Listo")).toBeInTheDocument();
  });

  it("ofrece pagar un pedido Pendiente y notifica el id", () => {
    const onPagar = vi.fn();
    render(
      <PedidoCard pedido={{ ...BASE, estado: "Pendiente" }} onPagar={onPagar} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Pagar" }));
    expect(onPagar).toHaveBeenCalledWith(7);
  });

  it("carga y muestra el detalle al abrirlo", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          text: () => Promise.resolve(JSON.stringify(DETALLE)),
        } as Response),
      ),
    );

    render(<PedidoCard pedido={BASE} onPagar={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }));

    expect(await screen.findByText("2 × Café americano")).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Ocultar detalle")).toBeInTheDocument(),
    );
  });
});
