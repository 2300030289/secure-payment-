import type { RiskInput, RiskResult } from './types';

const HIGH_AMOUNT_THRESHOLD = 80000;
const EXTREME_AMOUNT_THRESHOLD = 400000;
const HIGH_RISK_LOCATIONS = [
  'lagos',
  'dhaka',
  'caracas',
  'pyongyang',
  'damascus',
  'tehran',
  'kiev',
  'khartoum',
];

export function assessRisk(input: RiskInput): RiskResult {
  const factors: string[] = [];
  let score = 0;

  const amount = Math.max(0, Number(input.amount) || 0);

  if (amount >= EXTREME_AMOUNT_THRESHOLD) {
    score += 45;
    factors.push('Extreme transaction amount');
  } else if (amount >= HIGH_AMOUNT_THRESHOLD) {
    score += 28;
    factors.push('High transaction amount');
  } else if (amount >= 30000) {
    score += 10;
  }

  if (amount > 0 && amount % 100 === 0 && amount >= 40000) {
    score += 8;
    factors.push('Round-number amount pattern');
  }

  const location = (input.location || '').trim().toLowerCase();
  if (HIGH_RISK_LOCATIONS.includes(location)) {
    score += 30;
    factors.push('High-risk geographic location');
  } else if (location.length === 0) {
    score += 12;
    factors.push('Missing location data');
  }

  const txnId = (input.transaction_id || '').trim();
  const customerId = (input.customer_user_id || '').trim();
  if (txnId.length < 6) {
    score += 10;
    factors.push('Unusually short transaction ID');
  }
  if (customerId.length === 0) {
    score += 8;
    factors.push('Missing customer ID');
  }

  if (/^(test|demo|fake|000|xxx)/i.test(txnId)) {
    score += 18;
    factors.push('Synthetic-looking transaction ID');
  }

  // Deterministic pseudo-frequency boost so demo data behaves realistically.
  const seed = (txnId + customerId).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const frequencyBoost = (seed % 7) * 4; // 0..24
  if (frequencyBoost > 12) {
    score += frequencyBoost;
    factors.push('Elevated transaction frequency');
  }

  score = Math.min(100, Math.max(0, score));

  return {
    score,
    status: score >= 50 ? 'suspicious' : 'safe',
    risk_factors: factors.length ? factors : ['No notable risk factors'],
  };
}

export function severityForScore(score: number): RiskResult['status'] extends never ? never : 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 65) return 'high';
  return 'medium';
}
