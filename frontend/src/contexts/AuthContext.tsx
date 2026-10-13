import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, clearToken, getToken, setToken } from "../lib/apiClient";
import type { LoginResponse, Usuario } from "../types";

interface AuthContextValue {
  usuario: Usuario | null;
  cargando: boolean;
  login: (correo: string, password: string) => Promise<Usuario>;
  registrar: (datos: {
    nombre: string;
    correo: string;
    password: string;
  }) => Promise<Usuario>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargarSesion() {
      const token = getToken();
      if (!token) {
        if (activo) {
          setCargando(false);
        }
        return;
      }
      try {
        const perfil = await api.get<Usuario>("/auth/me");
        if (activo) {
          setUsuario(perfil);
        }
      } catch {
        clearToken();
        if (activo) {
          setUsuario(null);
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }

    void cargarSesion();
    return () => {
      activo = false;
    };
  }, []);

  const login = useCallback(async (correo: string, password: string) => {
    const resultado = await api.post<LoginResponse>("/auth/login", {
      correo,
      password,
    });
    setToken(resultado.token);
    setUsuario(resultado.usuario);
    return resultado.usuario;
  }, []);

  const registrar = useCallback(
    async (datos: { nombre: string; correo: string; password: string }) => {
      return api.post<Usuario>("/auth/register", datos);
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    setUsuario(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ usuario, cargando, login, registrar, logout }),
    [usuario, cargando, login, registrar, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  }
  return contexto;
}
