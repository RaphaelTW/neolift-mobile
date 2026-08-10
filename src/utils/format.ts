export const titleCase = (value: string) => value.replace(/\b\w/g, c => c.toUpperCase());
export const compactNumber = (value: number) => new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value);
export const dayLabel = (iso: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(new Date(iso));
export const dateLong = (iso: string) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(iso));
export const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
