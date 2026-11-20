import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number to Indonesian Rupiah (e.g. Rp 1.489.143.614)
 * Deterministic implementation that guarantees exact same output across server & client
 */
export function formatIDR(amount: number, options?: { hideSymbol?: boolean; decimals?: number }): string {
  if (isNaN(amount) || amount === undefined || amount === null) return "Rp 0";
  
  const decimals = options?.decimals ?? 0;
  const num = Number(amount);
  const fixed = decimals > 0 ? num.toFixed(decimals) : Math.round(num).toString();
  const parts = fixed.split('.');
  
  // Format integer with dot separator
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = parts.length > 1 && decimals > 0 ? `${integerPart},${parts[1]}` : integerPart;

  return options?.hideSymbol ? formatted : `Rp ${formatted}`;
}

/**
 * Format large IDR amounts compactly (e.g. Rp 462,8 M / Rp 1,5 T)
 * Deterministic string replacement avoiding locale ICU differences
 */
export function formatCompactIDR(amount: number): string {
  if (isNaN(amount) || amount === 0) return "Rp 0";
  
  const absAmount = Math.abs(amount);
  if (absAmount >= 1_000_000_000_000) {
    const val = (amount / 1_000_000_000_000).toFixed(1).replace('.', ',');
    return `Rp ${val} T`;
  }
  if (absAmount >= 1_000_000_000) {
    const val = (amount / 1_000_000_000).toFixed(1).replace('.', ',');
    return `Rp ${val} M`;
  }
  if (absAmount >= 1_000_000) {
    const val = (amount / 1_000_000).toFixed(1).replace('.', ',');
    return `Rp ${val} Jt`;
  }
  return formatIDR(amount);
}

/**
 * Format crypto balance with appropriate precision deterministically
 */
export function formatCrypto(amount: number, symbol: string = ''): string {
  if (isNaN(amount) || amount === 0) return `0 ${symbol}`.trim();
  
  let decimals = 4;
  if (symbol.toUpperCase() === 'BTC') decimals = 6;
  if (symbol.toUpperCase() === 'ETH') decimals = 5;
  if (symbol.toUpperCase() === 'SOL') decimals = 3;

  const num = Number(amount);
  const fixed = num.toFixed(decimals);
  // Trim trailing zeros after decimal
  const trimmed = fixed.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
  const parts = trimmed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = parts.length > 1 ? `${integerPart},${parts[1]}` : integerPart;

  return symbol ? `${formatted} ${symbol}` : formatted;
}

/**
 * Format percentage change (e.g. +4.18% or -1.25%)
 */
export function formatPercent(value: number): string {
  if (isNaN(value)) return "0.00%";
  const num = Number(value);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num.toFixed(2)}%`;
}
