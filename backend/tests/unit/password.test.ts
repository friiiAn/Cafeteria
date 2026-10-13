import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "../../src/utils/password.js";

describe("utils/password", () => {
  it("genera un hash distinto del texto plano", async () => {
    const hash = await hashPassword("secreto123");
    expect(hash).not.toBe("secreto123");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("acepta la contraseña correcta", async () => {
    const hash = await hashPassword("secreto123");
    await expect(verifyPassword("secreto123", hash)).resolves.toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("secreto123");
    await expect(verifyPassword("otra-clave", hash)).resolves.toBe(false);
  });

  it("genera hashes diferentes para la misma contraseña (salt)", async () => {
    const a = await hashPassword("secreto123");
    const b = await hashPassword("secreto123");
    expect(a).not.toBe(b);
  });
});
