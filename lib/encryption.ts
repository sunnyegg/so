// Simple base64 encoding/decoding for basic encryption
export function encrypt(text: string): string {
  return Buffer.from(text).toString("base64");
}

export function decrypt(text: string): string {
  return Buffer.from(text, "base64").toString("utf-8");
}
