export type TickerQuote = {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
};

export type ChartPoint = {
  t: string;
  price: number;
  ts?: number;
};

export type MarketAlert = {
  id: string;
  symbol: string;
  kind: "above" | "below";
  threshold: number;
  price: number;
  t: number;
};
