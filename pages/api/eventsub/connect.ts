import { decrypt } from "@/lib/encryption";

export default function handler(req: any, res: any) {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decryptedToken = decrypt(token);

    return res.status(200).json({
      status: true,
      data: decryptedToken,
    });
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ status: false });
  }
}
