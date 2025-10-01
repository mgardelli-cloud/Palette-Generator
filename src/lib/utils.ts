import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina i nomi delle classi con gestione delle classi di utilità Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Genera un ID univoco
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Formatta una data in formato leggibile
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Copia del testo negli appunti
 * @returns Promise<boolean> - true se la copia è andata a buon fine, false altrimenti
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Errore durante la copia negli appunti:', err);
    return false;
  }
}

/**
 * Genera un colore casuale in formato esadecimale
 */
export function getRandomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
}

/**
 * Formatta un colore esadecimale nel formato corretto
 * @example formatHex('abc') => '#AABBCC'
 */
export function formatHex(hex: string): string {
  let color = hex.replace('#', '').toUpperCase();
  
  // Gestisci la notazione abbreviata (es. #ABC -> #AABBCC)
  if (color.length === 3) {
    color = color.split('').map(c => c + c).join('');
  }
  
  return `#${color}`;
}

/**
 * Determina il colore del testo in base allo sfondo per garantire la leggibilità
 * @returns '#000000' per sfondi chiari, '#FFFFFF' per sfondi scuri
 */
export function getTextColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Formula di luminanza WCAG
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Formatta un nome di colore in un formato leggibile
 * @example formatColorName('dark-blue') => 'Dark Blue'
 */
export function formatColorName(name: string): string {
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Crea una funzione che ritarda l'esecuzione di una funzione
 * @param func - La funzione da eseguire
 * @param wait - Tempo di attesa in millisecondi
 * @returns Una nuova funzione che esegue la funzione originale dopo il ritardo
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Calcola il rapporto di contrasto tra due colori (WCAG 2.0)
 * @returns Un numero compreso tra 1 (stesso colore) e 21 (massimo contrasto)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    // Rimuovi il carattere # se presente
    const hexColor = hex.startsWith('#') ? hex.substring(1) : hex;

    // Converti in RGB
    const r = parseInt(hexColor.substring(0, 2), 16) / 255;
    const g = parseInt(hexColor.substring(2, 4), 16) / 255;
    const b = parseInt(hexColor.substring(4, 6), 16) / 255;

    // Applica la correzione gamma
    const sRGB = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    // Calcola la luminanza relativa (formula WCAG 2.0)
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
  };

  // Aggiungi un piccolo valore per evitare divisioni per zero
  const l1 = getLuminance(color1) + 0.05;
  const l2 = getLuminance(color2) + 0.05;

  // Restituisci il rapporto di contrasto (sempre >= 1)
  return l1 > l2 ? l1 / l2 : l2 / l1;
}
