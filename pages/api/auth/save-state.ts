import fs from "fs";

export default function handler(req, res) {
  const { state } = JSON.parse(req.body);

  fs.writeFileSync("state.json", JSON.stringify({ state: state }));

  return res.status(200).json({ status: true });
}
