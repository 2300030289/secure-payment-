import { ShieldCheck, AlertTriangle, Activity, Users, IndianRupee, TrendingUp, type LucideIcon } from 'lucide-react';

interface AdminMetricCardsProps {
  totalTransactions: number;
  suspicious: number;
  totalUsers: number;
  totalVolume: number;
  activeAlerts: number;
  avgRisk: number;
}

export default function AdminMetricCards({
  totalTransactions,
  suspicious,
  totalUsers,
  totalVolume,
  activeAlerts,
  avgRisk,
}: AdminMetricCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <Card icon={Activity} label="Transactions" value={totalTransactions.toLocaleString()} accent="brand" />
      <Card
        icon={AlertTriangle}
        label="Suspicious"
        value={suspicious.toLocaleString()}
        accent="amber"
        sub={totalTransactions ? `${Math.round((suspicious / totalTransactions) * 100)}% rate` : '—'}
      />
      <Card icon={Users} label="Users" value={totalUsers.toLocaleString()} accent="slate" />
      <Card
        icon={AlertTriangle}
        label="Active Alerts"
        value={activeAlerts.toLocaleString()}
        accent="red"
        sub={activeAlerts > 0 ? 'Needs attention' : 'All clear'}
      />
      <Card
        icon={IndianRupee}
        label="Total Volume"
        value={`\u20B9${totalVolume.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        accent="emerald"
      />
      <Card
        icon={TrendingUp}
        label="Avg Risk"
        value={`${Math.round(avgRisk)}/100`}
        accent={avgRisk >= 50 ? 'amber' : 'brand'}
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
  accent: 'brand' | 'amber' | 'emerald' | 'slate' | 'red';
}) {
  const accents: Record<string, string> = {
    brand: 'text-brand-300 bg-brand-500/10 ring-brand-400/20',
    amber: 'text-amber-300 bg-amber-500/10 ring-amber-400/20',
    emerald: 'text-emerald-300 bg-emerald-500/10 ring-emerald-400/20',
    slate: 'text-slate-300 bg-ink-700/40 ring-ink-600/30',
    red: 'text-red-300 bg-red-500/10 ring-red-400/20',
  };

  return (
    <div className="rounded-2xl glass p-4 shadow-card transition hover:border-ink-500/50 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-xs">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ring-1 ${accents[accent]}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-2.5 font-mono text-xl font-bold text-slate-50 sm:text-2xl">{value}</p>
      {sub && <p className="mt-1 text-[10px] text-slate-500 sm:text-xs">{sub}</p>}
    </div>
  );
}
