import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../../src/utils/jwt.js";

describe("utils/jwt", () => {
  it("firma y verifica un token válido", () => {
    const token = signToken({ sub: 42, rol: "administrador" });
    const payload = verifyToken(token);
    expect(payload.sub).toBe(42);
    expect(payload.rol).toBe("administrador");
  });

  it("rechaza un token adulterado", () => {
    const token = signToken({ sub: 1, rol: "usuario" });
    const adulterado = `${token}x`;
    expect(() => verifyToken(adulterado)).toThrow();
  });

  it("rechaza un token firmado con otra clave", () => {
    const token = signToken({ sub: 1, rol: "usuario" });
    expect(() => verifyToken(`${token}.firma`)).toThrow();
  });
});
