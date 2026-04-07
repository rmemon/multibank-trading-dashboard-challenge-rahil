export type Instrument = {
  symbol: string;
  name: string;
  /** Session anchor — random walk evolves from here (roughly realistic levels for demo). */
  basePrice: number;
};

/** Static catalog — simulated feed uses these symbols. */
export const INSTRUMENTS: Instrument[] = [
  { symbol: "AAPL", name: "Apple Inc.", basePrice: 218.4 },
  { symbol: "TSLA", name: "Tesla Inc.", basePrice: 286.75 },
  { symbol: "BTC-USD", name: "Bitcoin USD", basePrice: 97820 },
  { symbol: "ETH-USD", name: "Ethereum USD", basePrice: 3428.5 },
  { symbol: "XRP-USD", name: "XRP USD", basePrice: 0.5842 },
];

export function getInstrument(symbol: string): Instrument | undefined {
  return INSTRUMENTS.find((i) => i.symbol.toUpperCase() === symbol.toUpperCase());
}
