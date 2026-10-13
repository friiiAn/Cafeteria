import { useSyncExternalStore } from "react";

export interface ItemCarrito {
  menu_dia_id: number;
  nombre: string;
  precio: number;
  cantidad: number;
}

const CLAVE = "cafeteria.carrito";

const listeners = new Set<() => void>();

function cargar(): ItemCarrito[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) {
      return [];
    }
    const datos = JSON.parse(crudo) as ItemCarrito[];
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

let items: ItemCarrito[] = cargar();

function emitir(): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(items));
  } catch {
    // almacenamiento no disponible: el carrito queda solo en memoria
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ItemCarrito[] {
  return items;
}

export function agregar(entrada: {
  id: number;
  nombre: string;
  precio: number;
}): void {
  const existente = items.find((item) => item.menu_dia_id === entrada.id);
  if (existente) {
    items = items.map((item) =>
      item.menu_dia_id === entrada.id
        ? { ...item, cantidad: item.cantidad + 1 }
        : item,
    );
  } else {
    items = [
      ...items,
      {
        menu_dia_id: entrada.id,
        nombre: entrada.nombre,
        precio: entrada.precio,
        cantidad: 1,
      },
    ];
  }
  emitir();
}

export function cambiarCantidad(menuDiaId: number, cantidad: number): void {
  if (cantidad <= 0) {
    items = items.filter((item) => item.menu_dia_id !== menuDiaId);
  } else {
    items = items.map((item) =>
      item.menu_dia_id === menuDiaId ? { ...item, cantidad } : item,
    );
  }
  emitir();
}

export function quitar(menuDiaId: number): void {
  cambiarCantidad(menuDiaId, 0);
}

export function vaciar(): void {
  items = [];
  emitir();
}

export function useCarrito() {
  const actuales = useSyncExternalStore(subscribe, getSnapshot);
  const total = actuales.reduce(
    (acumulado, item) => acumulado + item.precio * item.cantidad,
    0,
  );
  const cantidad = actuales.reduce(
    (acumulado, item) => acumulado + item.cantidad,
    0,
  );
  return { items: actuales, total, cantidad };
}
