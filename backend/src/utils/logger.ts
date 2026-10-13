type Nivel = "info" | "warn" | "error";

function log(nivel: Nivel, mensaje: string, meta?: unknown): void {
  const marca = new Date().toISOString();
  const linea = `[${marca}] [${nivel.toUpperCase()}] ${mensaje}`;
  if (nivel === "error") {
    console.error(linea, meta ?? "");
  } else if (nivel === "warn") {
    console.warn(linea, meta ?? "");
  } else {
    console.log(linea, meta ?? "");
  }
}

export const logger = {
  info: (mensaje: string, meta?: unknown) => log("info", mensaje, meta),
  warn: (mensaje: string, meta?: unknown) => log("warn", mensaje, meta),
  error: (mensaje: string, meta?: unknown) => log("error", mensaje, meta),
};
