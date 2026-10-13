export const ROLES = ["administrador", "cajero", "cocinero", "usuario"] as const;

export type Rol = (typeof ROLES)[number];

export interface Usuario {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}

export interface Platillo {
  id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  activo: boolean;
}

export interface MenuEntrada {
  id: number;
  fecha: string;
  platillo_id: number;
  nombre: string;
  categoria: string | null;
  descripcion: string | null;
  precio: number;
  disponible: boolean;
  especial: boolean;
}

export const RUTA_POR_ROL: Record<Rol, string> = {
  administrador: "/admin",
  cajero: "/caja",
  cocinero: "/cocina",
  usuario: "/menu",
};

export const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: "Administrador",
  cajero: "Cajero",
  cocinero: "Cocinero",
  usuario: "Cliente",
};
