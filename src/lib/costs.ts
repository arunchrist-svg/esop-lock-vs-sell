export const LOCK_PRICE = 34;
export const BROKERAGE_RATE = 0.0012;
export const GST_RATE = 0.18;
export const STT_RATE = 0.001;
/** NSE equity delivery exchange txn charge */
const EXCHANGE_RATE = 0.0000297;
/** SEBI turnover fee */
const SEBI_RATE = 0.000001;

export type CostParts = {
  brokerage: number;
  gst: number;
  stt: number;
  statutory: number;
  total: number;
};

export function nuvamaCost(shares: number): CostParts {
  const brokerage = shares * LOCK_PRICE * BROKERAGE_RATE;
  const gst = brokerage * GST_RATE;
  const stt = shares * LOCK_PRICE * STT_RATE;
  return { brokerage, gst, stt, statutory: 0, total: brokerage + gst + stt };
}

export function zerodhaCost(shares: number, price: number): CostParts {
  const turnover = shares * price;
  const stt = turnover * STT_RATE;
  const exchange = turnover * EXCHANGE_RATE;
  const sebi = turnover * SEBI_RATE;
  const gst = (exchange + sebi) * GST_RATE;
  return {
    brokerage: 0,
    gst,
    stt,
    statutory: exchange + sebi,
    total: stt + exchange + sebi + gst,
  };
}

export function breakEvenPrice(shares: number): number | null {
  if (shares <= 0) return null;
  const locked = nuvamaCost(shares).total;
  const factor = STT_RATE + EXCHANGE_RATE + SEBI_RATE + GST_RATE * (EXCHANGE_RATE + SEBI_RATE);
  return locked / (shares * factor);
}

export function inr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: n >= 100 ? 0 : 2,
  }).format(n);
}

export function sharesLabel(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}
