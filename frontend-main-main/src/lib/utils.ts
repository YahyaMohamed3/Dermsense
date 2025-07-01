import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function typewriterEffect(
  text: string,
  onUpdate: (text: string) => void,
  speed: number = 50
): () => void {
  let i = 0;
  const timer = setInterval(() => {
    if (i < text.length) {
      onUpdate(text.substring(0, i + 1));
      i++;
    } else {
      clearInterval(timer);
    }
  }, speed);

  return () => clearInterval(timer);
}