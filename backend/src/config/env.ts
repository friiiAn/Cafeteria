import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL es obligatorio"),
  JWT_SECRET: z.string().min(8, "JWT_SECRET debe tener al menos 8 caracteres"),
  JWT_EXPIRES_IN: z.string().default("8h"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  PAYMENT_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  PAYMENT_API_KEY: z.string().default(""),
  MIN_LEAD_MINUTES: z.coerce.number().int().nonnegative().default(10),
  MAIL_PROVIDER: z.enum(["console", "fail"]).default("console"),
  MAIL_FROM: z.string().default("Cafetería ITSH <no-reply@itsh.edu.mx>"),
  NOTIFICACION_MAX_INTENTOS: z.coerce.number().int().positive().default(5),
  NOTIFICACION_POLL_MS: z.coerce.number().int().nonnegative().default(15000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const detalles = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Configuración de entorno inválida -> ${detalles}`);
}

export const env = parsed.data;
