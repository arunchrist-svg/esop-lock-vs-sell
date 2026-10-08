import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Scale, ArrowRight } from "lucide-react";
import {
  LOCK_PRICE,
  breakEvenPrice,
  inr,
  nuvamaCost,
  sharesLabel,
  zerodhaCost,
} from "@/lib/costs";

export const Route = createFileRoute("/")({ component: Home });

const PRICE_MIN = 30;
const PRICE_MAX = 160;

function Home() {
  const [sharesRaw, setSharesRaw] = useState("");
  const [price, setPrice] = useState(55);

  const shares = Math.max(0, Math.floor(Number(sharesRaw) || 0));

  const result = useMemo(() => {
    if (shares <= 0 || price <= 0) return null;
    const nuvama = nuvamaCost(shares);
    const zerodha = zerodhaCost(shares, price);
    const diff = nuvama.total - zerodha.total;
    const winner = Math.abs(diff) < 1 ? "tie" : diff > 0 ? "zerodha" : "nuvama";
    return { nuvama, zerodha, diff, winner, be: breakEvenPrice(shares) };
  }, [shares, price]);

  const maxBar = result ? Math.max(result.nuvama.total, result.zerodha.total, 1) : 1;

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="mb-8 flex items-start gap-4">
        <span className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-white">
          <Scale className="size-5" strokeWidth={1.75} />
        </span>
        <div>
          <p className="text-xs font-medium tracking-[0.16em] text-primary uppercase">
            ESOP sale costs
          </p>
          <h1 className="font-display text-3xl font-semibold leading-tight text-fg sm:text-4xl">
            Lock vs sell
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Nuvama brokerage and STT are locked at the IPO price of ₹{LOCK_PRICE}. Zerodha
            delivery is ₹0 brokerage — STT and statutory charges follow the price you actually sell at.
          </p>
        </div>
      </header>

      <section className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex min-w-0 flex-col gap-2 rounded-2xl border border-line bg-surface px-4 py-4">
          <span className="text-xs font-medium tracking-wide text-muted uppercase">Your shares</span>
          <input
            type="text"
            inputMode="numeric"
            className="h-12 w-full min-w-0 rounded-xl border border-line bg-bg px-3 text-lg font-medium text-fg outline-none placeholder:text-muted/70 focus:border-primary"
            value={sharesRaw}
            onChange={(e) => setSharesRaw(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="Enter your ESOP count"
            aria-label="Your ESOP shares"
          />
          <span className="text-xs text-muted">
            {shares > 0 ? `${sharesLabel(shares)} shares` : "Type how many ESOPs you hold"}
          </span>
        </label>
        <div className="flex min-w-0 flex-col gap-3 rounded-2xl border border-line bg-surface px-4 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-xs font-medium tracking-wide text-muted uppercase">Sell price</span>
            <span className="font-display text-3xl font-semibold text-primary">₹{price}</span>
          </div>
          <input
            type="range"
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            aria-label="Sell price per share"
            className="h-11 w-full cursor-pointer accent-primary"
          />
          <div className="flex justify-between text-xs text-muted">
            <span>₹{PRICE_MIN}</span>
            <span>per share</span>
            <span>₹{PRICE_MAX}</span>
          </div>
        </div>
      </section>

      {result ? (
        <>
          <section
            className={`mt-6 rounded-2xl border px-5 py-5 ${
              result.winner === "zerodha"
                ? "border-primary/30 bg-primary-dim"
                : result.winner === "nuvama"
                  ? "border-secondary/40 bg-secondary-dim"
                  : "border-line bg-surface"
            }`}
          >
            <p className="text-xs font-medium tracking-[0.14em] text-muted uppercase">Winner</p>
            <p className="font-display mt-1 text-3xl font-semibold text-fg">
              {result.winner === "tie"
                ? "It's a wash"
                : result.winner === "zerodha"
                  ? "Zerodha is cheaper"
                  : "Nuvama lock is cheaper"}
            </p>
            <p className="mt-2 text-sm text-muted">
              {result.winner === "tie" ? (
                "Costs match within a rupee."
              ) : (
                <>
                  Save{" "}
                  <span className="font-medium text-fg">{inr(Math.abs(result.diff))}</span> by
                  selling through {result.winner === "zerodha" ? "Zerodha" : "Nuvama"}.
                </>
              )}
            </p>
            {result.be != null && (
              <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                <ArrowRight className="size-4 text-secondary" />
                Break-even around <span className="text-fg">{inr(result.be)}</span> per share.
                Below that, Zerodha wins.
              </p>
            )}
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <CostCard
              name="Nuvama"
              hint={`Locked at ₹${LOCK_PRICE}`}
              tone="secondary"
              parts={result.nuvama}
              width={(result.nuvama.total / maxBar) * 100}
              won={result.winner === "nuvama"}
            />
            <CostCard
              name="Zerodha"
              hint="₹0 delivery brokerage"
              tone="primary"
              parts={result.zerodha}
              width={(result.zerodha.total / maxBar) * 100}
              won={result.winner === "zerodha"}
            />
          </section>

          <p className="mt-6 text-xs leading-relaxed text-muted">
            Nuvama: shares × ₹{LOCK_PRICE} × 0.12% brokerage, plus 18% GST on brokerage, plus
            0.10% STT. Zerodha: 0.10% STT on the actual sale value, plus NSE exchange, SEBI fee,
            and 18% GST on those statutory charges. Stamp duty on delivery sell is treated as nil.
            Prepayment of the loan itself is separate and has no fee.
          </p>
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-5 py-8 text-center text-sm text-muted">
          Enter your ESOP count, then slide the sale price.
        </p>
      )}
    </main>
  );
}

function CostCard({
  name,
  hint,
  tone,
  parts,
  width,
  won,
}: {
  name: string;
  hint: string;
  tone: "primary" | "secondary";
  parts: { brokerage: number; gst: number; stt: number; statutory: number; total: number };
  width: number;
  won: boolean;
}) {
  const bar = tone === "secondary" ? "bg-secondary" : "bg-primary";
  return (
    <article className="rounded-2xl border border-line bg-surface px-4 py-4">
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-fg">{name}</h2>
          <p className="text-xs text-muted">{hint}</p>
        </div>
        {won && <span className="text-xs font-medium text-primary">Lower cost</span>}
      </div>
      <p className="font-display mt-3 text-3xl font-semibold text-fg">{inr(parts.total)}</p>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.max(4, width)}%` }} />
      </div>
      <dl className="mt-4 space-y-1.5 text-sm">
        <Row k="Brokerage" v={parts.brokerage} />
        <Row k="GST" v={parts.gst} />
        <Row k="STT" v={parts.stt} />
        {parts.statutory > 0 && <Row k="Exchange + SEBI" v={parts.statutory} />}
      </dl>
    </article>
  );
}

function Row({ k, v }: { k: string; v: number }) {
  return (
    <div className="flex justify-between gap-3 text-muted">
      <dt>{k}</dt>
      <dd className="text-fg">{inr(v)}</dd>
    </div>
  );
}
