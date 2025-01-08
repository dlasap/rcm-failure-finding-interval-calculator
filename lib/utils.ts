import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return formatter.format(amount)
}

export function formatNumber(value: number, decimalSeparator: '.' | ',' = '.'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return formatter.format(value).replace('.', decimalSeparator)
}

export function formatInterval(years: number): string {
  return `${years.toFixed(1)} years`
}

export const getTokenDetails = (token) => {
  const tokenDetails = jwt.decode(token);

  return tokenDetails;
};

export const setLocalStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getLocalStorage = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

export const removeLocalStorage = (key) => {
  localStorage.removeItem(key);
};  
