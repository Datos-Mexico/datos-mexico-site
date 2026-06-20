// 32 bytes (256 bits) de entropía codificados como 64 chars hex.
// Suficiente para que un token no sea adivinable por fuerza bruta
// dentro del horizonte del observatorio.
const TOKEN_BYTES = 32;

export function generateToken(): string {
  const bytes = new Uint8Array(TOKEN_BYTES);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export function isValidTokenShape(value: unknown): value is string {
  return typeof value === "string" && TOKEN_PATTERN.test(value);
}
