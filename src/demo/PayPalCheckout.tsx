import { useEffect, useRef, useState } from "react";

let sdkPromise: Promise<any> | undefined;
function loadSdk(clientId: string) {
  if (!sdkPromise)
    sdkPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=USD&intent=capture&components=buttons&disable-funding=card,credit,paylater,venmo`;
      script.onload = () => resolve((window as any).paypal);
      script.onerror = () => {
        script.remove();
        sdkPromise = undefined;
        reject(
          new Error("PayPal could not load. Check your connection and retry."),
        );
      };
      document.head.appendChild(script);
    });
  return sdkPromise;
}
export async function request(action: string, body?: unknown) {
  const response = await fetch(
    `/api/paypal/${action}`,
    body
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      : {},
  );
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "The payment API is unavailable. Run the full demo server or use a configured Vercel preview.",
    );
  }
  if (!response.ok) throw new Error(data.error || "Sandbox request failed.");
  return data;
}
export function PayPalCheckout({
  mode,
  onComplete,
}: {
  mode: "desktop" | "vr";
  onComplete: (receipt: any) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("Connecting to PayPal Sandbox…");
  const [retry, setRetry] = useState(0);
  const ticket = useRef("");
  const complete = useRef(onComplete);
  complete.current = onComplete;
  useEffect(() => {
    let disposed = false;
    let buttons: any;
    const attempt = crypto.randomUUID();
    setError("");
    setStatus("Connecting to PayPal Sandbox…");
    (async () => {
      const config = await request("config");
      const sdk = await loadSdk(config.clientId);
      if (disposed) return;
      buttons = sdk.Buttons({
        fundingSource: sdk.FUNDING.PAYPAL,
        style: { layout: "vertical", label: "pay" },
        createOrder: async () => {
          setError("");
          setStatus("Creating a $1.00 test order…");
          const order = await request("create", { mode, attempt });
          ticket.current = order.ticket;
          return order.id;
        },
        onApprove: async () => {
          if (disposed) return;
          setStatus("Verifying capture on the server…");
          try {
            const receipt = await request("capture", {
              ticket: ticket.current,
            });
            if (!disposed) complete.current(receipt);
          } catch (e) {
            if (!disposed) {
              setError((e as Error).message);
              setStatus("Payment needs verification.");
            }
          }
        },
        onCancel: () => {
          if (!disposed)
            setStatus(
              "Checkout cancelled. No demo completion was recorded. You can try again.",
            );
        },
        onError: (e: Error) => {
          if (!disposed) {
            setError(e.message || "PayPal checkout failed.");
            setStatus("Checkout unavailable.");
          }
        },
      });
      await buttons.render(container.current);
      if (!disposed)
        setStatus(
          "Pay with a PayPal Sandbox personal account. No real money moves.",
        );
    })().catch((e) => {
      if (!disposed) {
        setError(e.message);
        setStatus("Sandbox is not connected.");
      }
    });
    return () => {
      disposed = true;
      buttons?.close?.();
    };
  }, [mode, retry]);
  return (
    <div className="payment-box">
      <p role="status">{status}</p>
      <div ref={container} />
      {error && (
        <div role="alert">
          <p>{error}</p>
          <button onClick={() => setRetry((v) => v + 1)}>
            Retry connection
          </button>
          {ticket.current && (
            <button
              onClick={async () => {
                try {
                  complete.current(
                    await request("capture", { ticket: ticket.current }),
                  );
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Verify existing payment
            </button>
          )}
        </div>
      )}
    </div>
  );
}
