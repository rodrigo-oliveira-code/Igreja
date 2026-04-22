import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value))
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date))
}

export const STATUS_MEMBRO_LABELS: Record<string, string> = {
  ATIVO: 'Ativo',
  INATIVO: 'Inativo',
  VISITANTE: 'Visitante',
  TRANSFERIDO: 'Transferido',
}

export const TIPO_EVENTO_LABELS: Record<string, string> = {
  CULTO: 'Culto',
  ENSAIO: 'Ensaio',
  REUNIAO: 'Reunião',
  CELULA: 'Célula',
  CONFERENCIA: 'Conferência',
  OUTRO: 'Outro',
}

export const STATUS_COLORS: Record<string, string> = {
  ATIVO: 'bg-green-100 text-green-800',
  INATIVO: 'bg-red-100 text-red-800',
  VISITANTE: 'bg-blue-100 text-blue-800',
  TRANSFERIDO: 'bg-yellow-100 text-yellow-800',
}
