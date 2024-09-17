import fs from "fs";

export default function handler(req: any, res: any) {
  const { state } = JSON.parse(req.body);

  fs.writeFileSync(__dirname + "/state.json", JSON.stringify({ state: state }));

  return res.status(200).json({ status: true });
}
