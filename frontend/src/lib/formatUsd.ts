export function formatUsd(value: number): string {
  const abs = Math.abs(value);
  const maxFrac = abs >= 1 ? 2 : 4;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: maxFrac,
    maximumFractionDigits: maxFrac,
  }).format(value);
}
