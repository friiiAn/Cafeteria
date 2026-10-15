import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { NuevoPedidoPage } from "./NuevoPedidoPage";
import type { MenuEntrada } from "../../types";

const MENU: MenuEntrada[] = [
  {
    id: 1,
    fecha: "2026-10-14",
    platillo_id: 1,
    nombre: "Café americano",
    categoria: "Bebidas",
    descripcion: null,
    precio: 25,
    disponible: true,
    especial: false,
  },
];

function respuesta(body: unknown): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((_url: string, init?: RequestInit) => {
      if (init?.method === "POST") {
        return respuesta({ id: 7, numero: "M-001" });
      }
      return respuesta(MENU);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("NuevoPedidoPage", () => {
  it("agrega un platillo y navega al cobro tras 'Ver cobro'", async () => {
    render(
      <MemoryRouter initialEntries={["/caja/nuevo"]}>
        <Routes>
          <Route path="/caja/nuevo" element={<NuevoPedidoPage />} />
          <Route path="/caja/:id/cobro" element={<p>Cobro listo</p>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("Café americano")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/agregar uno de café americano/i));
    fireEvent.click(screen.getByRole("button", { name: /ver cobro/i }));

    await waitFor(() =>
      expect(screen.getByText("Cobro listo")).toBeInTheDocument(),
    );
  });
});
