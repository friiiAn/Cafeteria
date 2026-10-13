export const ROLES = ["administrador", "cajero", "cocinero", "usuario"] as const;

export type Rol = (typeof ROLES)[number];

export const ROLES_OPERATIVOS = ["administrador", "cajero", "cocinero"] as const;

export type RolOperativo = (typeof ROLES_OPERATIVOS)[number];

export interface UsuarioPublico {
  id: number;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
}

export interface UsuarioConHash extends UsuarioPublico {
  passwordHash: string;
}
