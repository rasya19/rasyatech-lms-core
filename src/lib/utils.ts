import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidGeminiKey(key: string | undefined): boolean {
  if (!key) return false;
  // Gemini keys are usually 39 chars long and start with AIza
  return key.length >= 20 && key.startsWith('AIza');
}
