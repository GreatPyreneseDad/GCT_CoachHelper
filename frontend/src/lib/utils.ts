import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function getTriageColor(coherence: {
  current: number;
  derivative: number;
  trend: string;
}): 'critical' | 'warning' | 'stable' | 'thriving' | 'breakthrough' {
  const { current, derivative, trend } = coherence;
  
  // Critical (Red) - Needs immediate attention
  if (current < 40 || derivative < -0.05 || trend === 'declining_fast') {
    return 'critical';
  }
  
  // Warning (Yellow) - Monitor closely
  if (current < 60 || derivative < -0.02 || trend === 'declining') {
    return 'warning';
  }
  
  // Stable (Blue) - Maintaining
  if (Math.abs(derivative) < 0.02 && trend === 'stable') {
    return 'stable';
  }
  
  // Thriving (Green) - Positive growth
  if (derivative > 0.02 || trend === 'improving') {
    return 'thriving';
  }
  
  // Breakthrough (Purple) - Exceptional progress
  if (derivative > 0.05 || trend === 'breakthrough') {
    return 'breakthrough';
  }
  
  return 'stable';
}