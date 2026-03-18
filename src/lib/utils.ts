import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatINR(value: number | string | undefined | null) {
  if (value === undefined || value === null) return "";
  const num = typeof value === "string" ? Number(value) : value;
  return Number.isNaN(num) ? "" : inrFormatter.format(num);
}
