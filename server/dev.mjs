import express from "express";
import { createServer } from "vite";
import { createHandler } from "./paypal.mjs";
import "dotenv/config";
const app = express();
app.use(express.json({ limit: "8kb" }));
const handler = createHandler();
app.all("/api/paypal/:action", (req, res) => {
  req.query.action = req.params.action;
  return handler(req, res);
});
const vite = await createServer({
  server: { middlewareMode: true },
  appType: "spa",
});
app.use(vite.middlewares);
app.listen(3000, "0.0.0.0", () =>
  console.log("BARKLEY demo: http://localhost:3000"),
);
