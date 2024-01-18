import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function roundDecimal(value: number, decimalPlace?: number) {
  switch (decimalPlace) {
    case 1: {
      return Math.round((value + Number.EPSILON) * 10) / 10;
    }
    case 2: {
      return Math.round((value + Number.EPSILON) * 100) / 100;
    }
    case 3: {
      return Math.round((value + Number.EPSILON) * 1000) / 1000;
    }
    case 4: {
      return Math.round((value + Number.EPSILON) * 10_000) / 10_000;
    }
    case 5: {
      return Math.round((value + Number.EPSILON) * 100_000) / 100_000;
    }
    default: {
      return Math.round((value + Number.EPSILON) * 1) / 1;
    }
  }
}
