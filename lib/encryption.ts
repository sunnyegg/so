import crypto from "node:crypto";

const SECRET_KEY = process.env.NEXT_ENCRYPTION_SECRET_KEY as string;
const IV = process.env.NEXT_ENCRYPTION_IV as string;

export const encrypt = (text: string) => {
  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET_KEY, IV);
  return (
    cipher.update(text, "utf8", "hex") +
    cipher.final("hex") +
    "." +
    cipher.getAuthTag().toString("hex")
  );
};

export const decrypt = (encryptedText: string) => {
  const cypher = encryptedText.split(".");
  const text = cypher[0];
  const tag = Buffer.from(cypher[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", SECRET_KEY, IV);
  decipher.setAuthTag(tag);
  return decipher.update(text, "hex", "utf8") + decipher.final("utf8");
};
