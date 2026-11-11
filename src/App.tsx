import { lazy, Suspense, useState } from "react";
import { PayPalCheckout } from "./demo/PayPalCheckout";
import "./demo/demo.css";
const Immersive = lazy(() => import("./demo/Immersive"));
const Cinematic = lazy(() => import("./CinematicDemo"));
type Mode = "desktop" | "vr";
type Receipt = {
  id: string;
  captureId: string;
  mode: Mode;
  amount: string;
  currency: string;
};
const steps = ["Verify", "Review", "Pay", "Receipt"];
export default function App() {
  const [name, setName] = useState(""),
    [draft, setDraft] = useState("");
  const [mode, setMode] = useState<Mode | null>(null),
    [cinematic, setCinematic] = useState(false);
  const [step, setStep] = useState(0),
    [region, setRegion] = useState("CA");
  const [scenario, setScenario] = useState("adult"),
    [ack, setAck] = useState(false);
  const [receipt, setReceipt] = useState<Receipt | null>(null),
    [history, setHistory] = useState<Receipt[]>([]);
  const [issue, setIssue] = useState(""),
    [rails, setRails] = useState(false);
  function reset(next: Mode | null) {
    setMode(next);
    setStep(0);
    setReceipt(null);
    setAck(false);
    setScenario("adult");
    setIssue("");
  }
  function advance() {
    if (step === 0 && scenario !== "adult") {
      setIssue(
        scenario === "minor"
          ? "Under 21: checkout blocked."
          : "ID mismatch: checkout blocked pending staff review.",
      );
      return;
    }
    if (step === 1 && !ack) {
      setIssue("Review and acknowledge the product information first.");
      return;
    }
    setIssue("");
    setStep(step + 1);
  }
  const titles = [
    "Verify eligibility",
    "Know what you are buying",
    "Complete a test payment",
    "Your test receipt",
  ];
  const details = [
    "Synthetic identity scenarios only. No face or ID images collected.",
    "Review labeled amounts and risks before proceeding.",
    "Leave VR to pay with a PayPal Sandbox buyer account in the browser.",
    "The server verifies a completed Sandbox capture before showing a receipt.",
  ];
  if (cinematic)
    return (
      <>
        <button className="cinematic-back" onClick={() => setCinematic(false)}>
          ← Demo lobby
        </button>
        <Suspense fallback={<p>Loading cinematic…</p>}>
          <Cinematic />
        </Suspense>
      </>
    );
  return (
    <div className="demo-app">
      <header className="demo-header">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            reset(null);
          }}
        >
          BARKLEY<span>Retail, considered.</span>
        </a>
        <div>
          <span className="sandbox-badge">SANDBOX · NO REAL MONEY</span>
          {name && (
            <button
              className="subtle"
              onClick={() => {
                setName("");
                setHistory([]);
                reset(null);
              }}
            >
              Sign out
            </button>
          )}
        </div>
      </header>
      {!name ? (
        <main className="login-layout">
          <section>
            <p className="eyebrow">THE BARKLEY EXPERIENCE</p>
            <h1>
              A better way
              <br />
              to check out.
            </h1>
            <p className="lede">
              Explore the counter on desktop, or stand in front of it in VR.
            </p>
            <div className="login-lines">
              <span>01 / Verify eligibility</span>
              <span>02 / Understand the product</span>
              <span>03 / Test checkout</span>
            </div>
          </section>
          <form
            className="demo-card"
            onSubmit={(e) => {
              e.preventDefault();
              if (draft.trim()) setName(draft.trim());
            }}
          >
            <p className="eyebrow">JUDGES & GUESTS</p>
            <h2>Enter the demo</h2>
            <p>No account or password needed. Your name stays in this tab.</p>
            <label htmlFor="guest-name">Your name</label>
            <input
              id="guest-name"
              required
              maxLength={60}
              autoComplete="off"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Alex Morgan"
            />
            <button className="primary" type="submit">
              Continue to demo lobby →
            </button>
            <small>
              Demo sign-in does not verify identity or create a secure account.
            </small>
          </form>
        </main>
      ) : !mode ? (
        <main className="lobby">
          <p className="eyebrow">WELCOME, {name.toUpperCase()}</p>
          <h1>Choose your perspective.</h1>
          <p className="lede">
            One journey. Two experiences. Complete each with its own $1.00
            Sandbox payment.
          </p>
          <div className="mode-grid">
            {(["desktop", "vr"] as Mode[]).map((choice, i) => (
              <button
                key={choice}
                className="mode-card"
                onClick={() => reset(choice)}
              >
                <div className={`mode-art ${choice}-art`}>
                  <div>{choice === "desktop" ? "BARKLEY" : "STEP INSIDE."}</div>
                </div>
                <p className="eyebrow">
                  0{i + 1} / {choice.toUpperCase()}
                </p>
                <h2>
                  {choice === "desktop" ? "At the counter" : "Inside the store"}
                </h2>
                <p>
                  {choice === "desktop"
                    ? "A guided point of sale for mouse, keyboard, or touch."
                    : "A 3D retail space. Use a WebXR headset or preview in your browser."}
                </p>
                <strong>Launch {choice} demo ↗</strong>
                <small>
                  {history.some((r) => r.mode === choice)
                    ? "✓ Test checkout completed"
                    : "PayPal Sandbox · $1.00 USD"}
                </small>
              </button>
            ))}
          </div>
          <button className="subtle" onClick={() => setCinematic(true)}>
            Watch original cinematic →
          </button>
          {history.length > 0 && (
            <p role="status">
              {history.length} completed test payments in this session.
            </p>
          )}
        </main>
      ) : (
        <main className="checkout-layout">
          <div className="checkout-top">
            <button className="subtle" onClick={() => reset(null)}>
              ← Demo lobby
            </button>
            <span>
              {mode.toUpperCase()} /{" "}
              {region === "CA" ? "CALIFORNIA" : "NEW YORK"}
            </span>
          </div>
          <nav aria-label="Checkout progress" className="step-list">
            {steps.map((s, i) => (
              <span
                key={s}
                aria-current={i === step ? "step" : undefined}
                className={i <= step ? "active" : ""}
              >
                {i < step ? "✓" : `0${i + 1}`} {s}
              </span>
            ))}
          </nav>
          {mode === "vr" && (
            <Suspense fallback={<p>Preparing immersive store…</p>}>
              <Immersive
                title={titles[step]}
                detail={
                  issue ||
                  (step === 0
                    ? `Synthetic scenario: ${scenario === "adult" ? "adult 21+, matching ID" : scenario === "minor" ? "under 21" : "ID mismatch"}. No actual ID or face verification.`
                    : step === 1
                      ? "Demo gummies: 2.5 mg THC + 5 mg CBD per serving. 10 servings. Effects can be delayed; THC may increase heart rate or anxiety. Purchase limits and lab results are not verified."
                      : details[step])
                }
                action={
                  step === 0
                    ? "Run eligibility scenario"
                    : step === 1
                      ? "Acknowledge & continue"
                      : step === 2
                        ? "Pay in browser"
                        : "View receipt in browser"
                }
                exitOnAction={step >= 2}
                onAction={() => {
                  if (step === 0) advance();
                  else if (step === 1) {
                    setAck(true);
                    setIssue("");
                    setStep(2);
                  } else
                    document
                      .getElementById("checkout-controls")
                      ?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            </Suspense>
          )}
          <div className="checkout-grid" id="checkout-controls">
            <section className="demo-card">
              <p className="eyebrow">BARKLEY / {steps[step].toUpperCase()}</p>
              <h1>{titles[step]}</h1>
              {step === 0 && (
                <>
                  <p>
                    This prototype uses synthetic scenarios. Government ID
                    verification, face matching, and liveness checks are not
                    connected.
                  </p>
                  <label htmlFor="region">Store location</label>
                  <select
                    id="region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  >
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                  </select>
                  <label htmlFor="scenario">Judge’s test scenario</label>
                  <select
                    id="scenario"
                    value={scenario}
                    onChange={(e) => {
                      setScenario(e.target.value);
                      setIssue("");
                    }}
                  >
                    <option value="adult">
                      Adult 21+ · ID match (simulated)
                    </option>
                    <option value="minor">
                      Under 21 · must block checkout
                    </option>
                    <option value="mismatch">ID mismatch · staff review</option>
                  </select>
                  <button className="primary" onClick={advance}>
                    Run eligibility scenario →
                  </button>
                </>
              )}
              {step === 1 && (
                <>
                  <div className="product">
                    <div className="product-pack">
                      B<span>DEMO GUMMIES</span>
                    </div>
                    <div>
                      <h2>Citrus gummy sample</h2>
                      <p>Synthetic label · no goods supplied</p>
                      <dl>
                        <dt>THC per serving</dt>
                        <dd>2.5 mg</dd>
                        <dt>CBD per serving</dt>
                        <dd>5 mg</dd>
                        <dt>Servings</dt>
                        <dd>10</dd>
                        <dt>Package totals</dt>
                        <dd>25 mg THC / 50 mg CBD</dd>
                      </dl>
                    </div>
                  </div>
                  <p>
                    Edibles can have delayed effects. THC may increase heart
                    rate and cause anxiety or impairment. Effects vary; these
                    amounts do not establish a safe dose for you.
                  </p>
                  <p className="notice">
                    Purchase-limit enforcement and lab verification are not
                    connected. This synthetic cart cannot be used for regulated
                    sales in {region === "CA" ? "California" : "New York"}.
                  </p>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={ack}
                      onChange={(e) => {
                        setAck(e.target.checked);
                        setIssue("");
                      }}
                    />
                    I reviewed the demonstration’s product and risk information.
                  </label>
                  <button className="primary" onClick={advance}>
                    Continue to Sandbox checkout →
                  </button>
                </>
              )}
              {step === 2 && (
                <>
                  <p>
                    Test charge: <strong>$1.00 USD</strong>. Use a Sandbox{" "}
                    <strong>personal buyer</strong> account, not your developer
                    or test business account.
                  </p>
                  <p>
                    Each experience creates a separate order. No products are
                    sold or fulfilled.
                  </p>
                  <PayPalCheckout
                    mode={mode}
                    onComplete={(result) => {
                      if (result.mode !== mode) return;
                      setReceipt(result);
                      setHistory((previous) =>
                        previous.some((r) => r.id === result.id)
                          ? previous
                          : [...previous, result],
                      );
                      setStep(3);
                    }}
                  />
                </>
              )}
              {step === 3 && receipt && (
                <>
                  <div className="receipt-check">✓</div>
                  <h2>Sandbox payment captured</h2>
                  <p>Verified on the server against PayPal Sandbox.</p>
                  <dl className="receipt">
                    <dt>Amount</dt>
                    <dd>
                      {receipt.amount} {receipt.currency}
                    </dd>
                    <dt>Experience</dt>
                    <dd>{receipt.mode}</dd>
                    <dt>Order</dt>
                    <dd>{receipt.id}</dd>
                    <dt>Capture</dt>
                    <dd>{receipt.captureId}</dd>
                  </dl>
                  <button
                    className="primary"
                    onClick={() => reset(mode === "desktop" ? "vr" : "desktop")}
                  >
                    Try the {mode === "desktop" ? "VR" : "desktop"} experience →
                  </button>
                  <button className="subtle" onClick={() => reset(null)}>
                    Return to lobby
                  </button>
                </>
              )}
              {issue && (
                <p role="alert" className="notice">
                  {issue}
                </p>
              )}
            </section>
            <aside className="demo-card summary">
              <p className="eyebrow">THE DEMO ORDER</p>
              <h2>Clarity at every step.</h2>
              <p>
                One synthetic sample cart.
                <br />
                One independently verified test payment.
              </p>
              <div className="total">
                <span>Sandbox total</span>
                <strong>$1.00</strong>
              </div>
              <p className="notice">
                Identity verification is simulated. Live payment acceptance,
                regulatory compliance, and product safety are not established by
                this demo.
              </p>
              <button
                className="subtle"
                onClick={() => setRails(!rails)}
                aria-expanded={rails}
              >
                Ganzevoort concept {rails ? "−" : "+"}
              </button>
              {rails && (
                <div className="rails">
                  <p>Illustrative architecture only</p>
                  <ol>
                    <li>Customer authorizes payment</li>
                    <li>Reserve and conversion service (proposed)</li>
                    <li>Merchant settlement rail (proposed)</li>
                    <li>Merchant receives confirmation</li>
                  </ol>
                  <p>
                    Only PayPal Sandbox is connected. No reserves, crypto
                    conversion, stablecoins, or central-bank systems are
                    connected.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </main>
      )}
      <footer className="demo-footer">
        BARKLEY × GANZEVOORT
        <span>Concept demonstration · Sandbox payments only</span>
      </footer>
    </div>
  );
}
