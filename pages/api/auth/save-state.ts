import fs from "fs/promises";

export default async function handler(req: any, res: any) {
  const { state } = JSON.parse(req.body);

  await fs.mkdir("/db", { recursive: true });
  await fs.writeFile("/db/state.json", JSON.stringify({ state: state }));

  return res.status(200).json({ status: true });
}
