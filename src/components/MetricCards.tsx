import { ShieldCheck, AlertTriangle, Activity, IndianRupee, type LucideIcon } from 'lucide-react';

interface MetricCardsProps {
  total: number;
  suspicious: number;
  safe: number;
  totalVolume: number;
  avgRisk: number;
}

export default function MetricCards({ total, suspicious, safe, totalVolume, avgRisk }: MetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card
        icon={Activity}
        label="Total Transactions"
        value={total.toLocaleString()}
        accent="brand"
      />
      <Card
        icon={AlertTriangle}
        label="Suspicious"
        value={suspicious.toLocaleString()}
        accent="amber"
        sub={total ? `${Math.round((suspicious / total) * 100)}% of total` : '0% of total'}
      />
      <Card
        icon={ShieldCheck}
        label="Safe"
        value={safe.toLocaleString()}
        accent="emerald"
        sub={total ? `${Math.round((safe / total) * 100)}% of total` : '0% of total'}
      />
      <Card
        icon={IndianRupee}
        label="Volume / Avg Risk"
        value={`\u20B9${totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        accent="slate"
        sub={`Avg risk ${Math.round(avgRisk)}/100`}
      />
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  accent: 'brand' | 'amber' | 'emerald' | 'slate';
}) {
  const accents: Record<string, string> = {
    brand: 'text-brand-300 bg-brand-500/10 ring-brand-400/20',
    amber: 'text-amber-300 bg-amber-500/10 ring-amber-400/20',
    emerald: 'text-emerald-300 bg-emerald-500/10 ring-emerald-400/20',
    slate: 'text-slate-300 bg-ink-700/40 ring-ink-600/30',
  };

  return (
    <div className="rounded-2xl glass p-5 shadow-card transition hover:border-ink-500/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-mono text-2xl font-bold text-slate-50">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
