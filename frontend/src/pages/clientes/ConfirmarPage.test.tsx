import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ConfirmarPage } from "./ConfirmarPage";
import { agregar, vaciar } from "../../lib/carrito";

function renderPagina() {
  return render(
    <MemoryRouter initialEntries={["/pedido/confirmar"]}>
      <Routes>
        <Route path="/pedido/confirmar" element={<ConfirmarPage />} />
        <Route path="/pedido/:id/pago" element={<div>PANTALLA PAGO</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vaciar();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vaciar();
});

describe("ConfirmarPage", () => {
  it("invita a volver al menú cuando el carrito está vacío", () => {
    renderPagina();
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
  });

  it("crea el pedido y navega al pago", async () => {
    agregar({ id: 1, nombre: "Café americano", precio: 25 });

    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          status: 201,
          text: () =>
            Promise.resolve(
              JSON.stringify({ id: 42, numero: "#042", total: 25 }),
            ),
        } as Response),
      ),
    );

    renderPagina();

    expect(screen.getByText("Café americano")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Continuar al pago" }));

    expect(await screen.findByText("PANTALLA PAGO")).toBeInTheDocument();
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1));
  });
});
