import { useEffect, useState } from "react";
import { api, ApiError } from "../../lib/apiClient";
import { hoyISO } from "../../lib/utils";
import type { MenuEntrada } from "../../types";
import { PlatilloCard } from "../../components/PlatilloCard";
import { Card, CardBody, CardTitle } from "../../components/ui/card";

export function MenuPage() {
  const [entradas, setEntradas] = useState<MenuEntrada[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    async function cargar() {
      try {
        const data = await api.get<MenuEntrada[]>("/menu/cliente");
        if (activo) {
          setEntradas(data);
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof ApiError ? err.message : "Error al cargar el menú");
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }
    void cargar();
    return () => {
      activo = false;
    };
  }, []);

  const especiales = entradas.filter((entrada) => entrada.especial);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Menú del día
        </h1>
        <p className="text-sm text-on-surface-variant">{hoyISO()}</p>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-on-surface-variant">Cargando…</p>
      ) : entradas.length === 0 ? (
        <Card>
          <CardBody>
            <CardTitle>Aún no hay menú publicado</CardTitle>
            <p className="mt-2 text-on-surface-variant">
              Vuelve más tarde; la cafetería todavía no publicó el menú de hoy.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {especiales.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-tertiary">
                Especiales del día
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {especiales.map((entrada) => (
                  <PlatilloCard key={entrada.id} entrada={entrada} />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-3">
            <h2 className="font-display text-lg font-bold text-on-surface">
              Platillos
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {entradas.map((entrada) => (
                <PlatilloCard key={entrada.id} entrada={entrada} />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
