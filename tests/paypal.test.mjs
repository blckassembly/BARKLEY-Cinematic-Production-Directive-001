import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler, ticket, verifyTicket } from "../server/paypal.mjs";
const env = {
  PAYPAL_CLIENT_ID: "test-client",
  PAYPAL_CLIENT_SECRET: "test-secret",
};
const signed = (extra = {}) =>
  ticket(
    { id: "ORDER123", mode: "desktop", exp: Date.now() + 60000, ...extra },
    env.PAYPAL_CLIENT_SECRET,
  );
const completed = {
  id: "ORDER123",
  status: "COMPLETED",
  purchase_units: [
    {
      reference_id: "desktop",
      payments: {
        captures: [
          {
            id: "CAPTURE123",
            status: "COMPLETED",
            amount: { value: "1.00", currency_code: "USD" },
          },
        ],
      },
    },
  ],
};
function response() {
  return {
    code: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.code = code;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
  };
}
async function run(action, body, fetcher, options = {}) {
  const res = response();
  await createHandler({ env, fetcher, ...options })(
    {
      method: action === "config" ? "GET" : "POST",
      query: { action },
      body,
      headers: {},
    },
    res,
  );
  return res;
}
test("missing configuration fails closed without exposing a secret", async () => {
  const r = await run("config", {}, null, { env: {} });
  assert.equal(r.code, 503);
  assert.ok(!JSON.stringify(r.data).includes("test-secret"));
});
test("public config exposes only the client id", async () => {
  const r = await run("config");
  assert.equal(r.data.clientId, "test-client");
  assert.ok(!JSON.stringify(r.data).includes("test-secret"));
});
test("tampered, expired, and malformed tickets fail before network access", async () => {
  for (const value of [signed() + "x", signed({ exp: 0 }), "bad"]) {
    const r = await run("capture", { ticket: value }, () =>
      assert.fail("must not call network"),
    );
    assert.equal(r.code, 400);
  }
});
test("tickets bind each mode and order", () => {
  assert.equal(
    verifyTicket(signed(), env.PAYPAL_CLIENT_SECRET).mode,
    "desktop",
  );
});
test("server owns amount; create retries carry a stable PayPal request id", async () => {
  let calls = [];
  const fetcher = async (url, init) => {
    calls.push({ url, init });
    return Response.json(
      url.endsWith("/token") ? { access_token: "token" } : { id: "ORDER123" },
    );
  };
  const attempt = "00000000-0000-4000-8000-000000000000";
  const r = await run(
    "create",
    { mode: "vr", attempt, amount: "0.01" },
    fetcher,
  );
  assert.equal(r.code, 200);
  const payload = JSON.parse(calls[1].init.body);
  assert.equal(payload.purchase_units[0].amount.value, "1.00");
  assert.equal(payload.purchase_units[0].reference_id, "vr");
  assert.equal(calls[1].init.headers["PayPal-Request-Id"], `vr-${attempt}`);
});
test("repeated captures reuse the completed order without another capture", async () => {
  let captures = 0;
  const fetcher = async (url) => {
    if (url.endsWith("/capture")) captures++;
    return Response.json(
      url.endsWith("/token") ? { access_token: "token" } : completed,
    );
  };
  const responses = await Promise.all(
    Array.from({ length: 100 }, () =>
      run("capture", { ticket: signed() }, fetcher),
    ),
  );
  assert.ok(
    responses.every((r) => r.code === 200 && r.data.captureId === "CAPTURE123"),
  );
  assert.equal(captures, 0);
});
test("pending, wrong amount, wrong currency, and wrong mode never produce receipts", async () => {
  for (const change of [
    (o) => (o.status = "APPROVED"),
    (o) => (o.purchase_units[0].payments.captures[0].status = "PENDING"),
    (o) => (o.purchase_units[0].payments.captures[0].amount.value = "0.01"),
    (o) =>
      (o.purchase_units[0].payments.captures[0].amount.currency_code = "EUR"),
    (o) => (o.purchase_units[0].reference_id = "vr"),
  ]) {
    const order = structuredClone(completed);
    change(order);
    const r = await run("capture", { ticket: signed() }, async (url) =>
      Response.json(url.endsWith("/token") ? { access_token: "token" } : order),
    );
    assert.equal(r.code, 502);
  }
});
test("provider failure produces no receipt", async () => {
  const r = await run("capture", { ticket: signed() }, async () =>
    Response.json({}, { status: 503 }),
  );
  assert.equal(r.code, 502);
});
test("invalid creation inputs never contact PayPal", async () => {
  const r = await run("create", { mode: "live", attempt: "bad" }, () =>
    assert.fail("network"),
  );
  assert.equal(r.code, 400);
});
test("approved orders are captured with a stable idempotency key before a receipt", async () => {
  let captured = false;
  const response = await run(
    "capture",
    { ticket: signed() },
    async (url, options) => {
      if (url.endsWith("/token"))
        return Response.json({ access_token: "token" });
      if (url.endsWith("/capture")) {
        assert.equal(options.headers["PayPal-Request-Id"], "capture-ORDER123");
        captured = true;
        return Response.json(completed);
      }
      return Response.json({ ...completed, status: "APPROVED" });
    },
  );
  assert.ok(captured);
  assert.equal(response.code, 200);
  assert.equal(response.data.captureId, "CAPTURE123");
});
