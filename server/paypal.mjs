import { createHmac, timingSafeEqual } from "node:crypto";

export const PRICE = "1.00";
const BASE = "https://api-m.sandbox.paypal.com";
export function configuration(env = process.env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET)
    throw new Error(
      "Sandbox credentials are not configured on this deployment.",
    );
  return { id: env.PAYPAL_CLIENT_ID, secret: env.PAYPAL_CLIENT_SECRET };
}
export function ticket(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${createHmac("sha256", secret).update(body).digest("base64url")}`;
}
export function verifyTicket(value, secret) {
  if (typeof value !== "string" || value.length > 3000)
    throw new Error("Invalid checkout ticket.");
  const [body, signature] = value.split(".");
  const expected = createHmac("sha256", secret)
    .update(body || "")
    .digest();
  const actual = Buffer.from(signature || "", "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    throw new Error("Invalid checkout ticket.");
  const data = JSON.parse(Buffer.from(body, "base64url").toString());
  if (
    !Number.isFinite(data.exp) ||
    data.exp < Date.now() ||
    !/^[A-Z0-9]+$/.test(data.id)
  )
    throw new Error("Checkout expired. Start a new checkout.");
  return data;
}
export function createHandler({ fetcher = fetch, env = process.env } = {}) {
  return async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const action = req.query?.action;
    if (
      (action === "config" && req.method !== "GET") ||
      (action !== "config" && req.method !== "POST")
    ) {
      res.setHeader("Allow", action === "config" ? "GET" : "POST");
      return res.status(405).json({ error: "Method not allowed." });
    }
    if (!["config", "create", "capture"].includes(action))
      return res.status(404).json({ error: "Unknown action." });
    if (req.headers?.origin) {
      try {
        if (new URL(req.headers.origin).host !== req.headers.host)
          throw new Error();
      } catch {
        return res.status(403).json({ error: "Origin not allowed." });
      }
    }
    let credentials;
    try {
      credentials = configuration(env);
    } catch (e) {
      return res.status(503).json({ error: e.message });
    }
    if (action === "config")
      return res
        .status(200)
        .json({
          clientId: credentials.id,
          environment: "sandbox",
          price: PRICE,
        });
    let body;
    try {
      body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    } catch {
      return res.status(400).json({ error: "Invalid JSON." });
    }
    let bound;
    if (
      action === "create" &&
      (!["desktop", "vr"].includes(body.mode) ||
        !/^[a-f0-9-]{36}$/i.test(body.attempt || ""))
    )
      return res
        .status(400)
        .json({ error: "Invalid demo mode or checkout attempt." });
    if (action === "capture") {
      try {
        bound = verifyTicket(body.ticket, credentials.secret);
      } catch (e) {
        return res.status(400).json({ error: e.message });
      }
    }
    try {
      const auth = await fetcher(`${BASE}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${credentials.id}:${credentials.secret}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
        signal: AbortSignal.timeout(15000),
      });
      if (!auth.ok)
        throw new Error(
          "PayPal Sandbox authentication failed. Check the deployment credentials.",
        );
      const { access_token } = await auth.json();
      const call = async (path, method = "GET", payload, key) => {
        const response = await fetcher(`${BASE}${path}`, {
          method,
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
            ...(key ? { "PayPal-Request-Id": key } : {}),
          },
          ...(payload ? { body: JSON.stringify(payload) } : {}),
          signal: AbortSignal.timeout(20000),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(
            "PayPal Sandbox could not complete this request. Retry or cancel checkout.",
          );
        return data;
      };
      if (action === "create") {
        const order = await call(
          "/v2/checkout/orders",
          "POST",
          {
            intent: "CAPTURE",
            purchase_units: [
              {
                reference_id: body.mode,
                description: `BARKLEY ${body.mode} demonstration — no goods or settlement`,
                amount: { currency_code: "USD", value: PRICE },
              },
            ],
          },
          `${body.mode}-${body.attempt}`,
        );
        return res
          .status(200)
          .json({
            id: order.id,
            ticket: ticket(
              { id: order.id, mode: body.mode, exp: Date.now() + 3600000 },
              credentials.secret,
            ),
          });
      }
      const path = `/v2/checkout/orders/${bound.id}`;
      let order = await call(path);
      if (order.status !== "COMPLETED")
        order = await call(
          `${path}/capture`,
          "POST",
          {},
          `capture-${bound.id}`,
        );
      const units = order.purchase_units || [];
      const captures = units.flatMap((unit) => unit.payments?.captures || []);
      if (
        order.status !== "COMPLETED" ||
        units.length !== 1 ||
        units[0].reference_id !== bound.mode ||
        captures.length !== 1 ||
        captures[0].status !== "COMPLETED" ||
        captures[0].amount?.value !== PRICE ||
        captures[0].amount?.currency_code !== "USD"
      )
        throw new Error("Payment is not a verified completed demo capture.");
      return res
        .status(200)
        .json({
          id: order.id,
          captureId: captures[0].id,
          status: "COMPLETED",
          mode: bound.mode,
          amount: PRICE,
          currency: "USD",
        });
    } catch (e) {
      return res
        .status(502)
        .json({
          error:
            e.message.startsWith("PayPal") || e.message.startsWith("Payment")
              ? e.message
              : "Sandbox service unavailable. Retry checkout.",
        });
    }
  };
}
