export function hoyISO(): string {
  const ahora = new Date();
  const y = ahora.getFullYear();
  const m = String(ahora.getMonth() + 1).padStart(2, "0");
  const d = String(ahora.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatoFecha(valor: Date | string): string {
  if (valor instanceof Date) {
    const y = valor.getFullYear();
    const m = String(valor.getMonth() + 1).padStart(2, "0");
    const d = String(valor.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  return String(valor).slice(0, 10);
}

function aFecha(valor: Date | string): Date {
  if (valor instanceof Date) {
    return valor;
  }
  return new Date(String(valor).replace(" ", "T"));
}

export function formatoFechaHora(valor: Date | string): string {
  const d = aFecha(valor);
  const y = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  return `${y}-${mes}-${dia}T${h}:${min}:${s}`;
}

export function formatoMySQL(valor: Date): string {
  return formatoFechaHora(valor).replace("T", " ");
}

