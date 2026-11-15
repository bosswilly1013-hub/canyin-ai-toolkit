const integer = new Intl.NumberFormat("zh-TW", { maximumFractionDigits: 0 });

export function ntd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${integer.format(Math.round(value))} 元`;
}

export function signedNtd(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const prefix = value > 0 ? "+" : "";
  return prefix + ntd(value);
}

export function num(value: number | null | undefined, digits = 1): string {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("zh-TW", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

/** `ratio` is 0–1, for example 0.32 → 32.0% */
export function pct(ratio: number | null | undefined, digits = 1): string {
  if (ratio == null || !Number.isFinite(ratio)) return "—";
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** Square meters to 坪. 1 坪 = 3.305785 m² */
export function ping(squareMeters: number): number {
  return squareMeters / 3.305785;
}
