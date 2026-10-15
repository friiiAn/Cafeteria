import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AdminHome } from "./AdminHome";

function respuesta(body: unknown): Promise<Response> {
  return Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response);
}

const USUARIOS = [
  { id: 1, nombre: "Ana", correo: "ana@itsh.edu.mx", rol: "cajero", activo: true },
  { id: 2, nombre: "Beto", correo: "beto@itsh.edu.mx", rol: "cocinero", activo: false },
];

const PLATILLOS = [
  { id: 1, nombre: "Café", categoria: "Bebidas", descripcion: null, activo: true },
];

const MENU = [
  {
    id: 1,
    fecha: "2026-10-14",
    platillo_id: 1,
    nombre: "Café americano",
    categoria: "Bebidas",
    descripcion: null,
    precio: 25,
    disponible: true,
    especial: true,
  },
];

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string) => {
      if (url.includes("/usuarios")) {
        return respuesta(USUARIOS);
      }
      if (url.includes("/platillos")) {
        return respuesta(PLATILLOS);
      }
      return respuesta(MENU);
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AdminHome", () => {
  it("muestra los conteos y el resumen del menú de hoy", async () => {
    render(
      <MemoryRouter>
        <AdminHome />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Platillos")).toBeInTheDocument();
    expect(screen.getByText(/menú del día/i)).toBeInTheDocument();
    expect(screen.getByText("Café americano")).toBeInTheDocument();
    expect(screen.getByText("Especial")).toBeInTheDocument();
  });
});
