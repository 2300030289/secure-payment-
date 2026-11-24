import { Bell, AlertTriangle, CheckCircle2, ShieldAlert, Inbox, Mail, Trash2 } from 'lucide-react';
import type { AdminAlert } from '@/lib/types';

interface AdminAlertsPanelProps {
  alerts: AdminAlert[];
  onResolve: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function AdminAlertsPanel({ alerts, onResolve, onDelete }: AdminAlertsPanelProps) {
  const unresolved = alerts.filter((a) => !a.is_resolved);
  const resolved = alerts.filter((a) => a.is_resolved);

  return (
    <div className="flex h-full flex-col rounded-2xl glass p-5 shadow-card sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-300" />
          <h2 className="text-lg font-semibold text-slate-100">All Alerts</h2>
        </div>
        {unresolved.length > 0 && (
          <span className="chip animate-pulse-soft bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30">
            {unresolved.length} active
          </span>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
          <Inbox className="mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">No alerts across the system</p>
          <p className="mt-1 text-xs text-slate-600">Suspicious transactions from any user will appear here.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '32rem' }}>
          {unresolved.map((alert) => (
            <AlertItem key={alert.id} alert={alert} onResolve={onResolve} onDelete={onDelete} />
          ))}
          {resolved.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Resolved</p>
              {resolved.map((alert) => (
                <AlertItem key={alert.id} alert={alert} onResolve={onResolve} onDelete={onDelete} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AlertItem({
  alert,
  onResolve,
  onDelete,
}: {
  alert: AdminAlert;
  onResolve: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const severityConfig = {
    critical: { icon: ShieldAlert, color: 'text-red-300', ring: 'ring-red-400/30', bg: 'bg-red-500/10' },
    high: { icon: AlertTriangle, color: 'text-amber-300', ring: 'ring-amber-400/30', bg: 'bg-amber-500/10' },
    medium: { icon: AlertTriangle, color: 'text-yellow-200', ring: 'ring-yellow-400/20', bg: 'bg-yellow-500/10' },
  };
  const cfg = severityConfig[alert.severity];
  const Icon = alert.is_resolved ? CheckCircle2 : cfg.icon;

  return (
    <div
      className={`group rounded-xl border p-4 transition ${
        alert.is_resolved
          ? 'border-ink-700/40 bg-ink-900/30 opacity-70'
          : `${cfg.bg} border-transparent ring-1 ${cfg.ring}`
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${alert.is_resolved ? 'text-emerald-400' : cfg.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{alert.title}</p>
          <p className="mt-1 text-xs text-slate-400">{alert.message}</p>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            <Mail className="h-3 w-3" />
            <span className="truncate">{alert.user_email ?? 'Unknown'}</span>
            <span>·</span>
            <span>{alert.severity}</span>
            <span>·</span>
            <span>{new Date(alert.created_at).toLocaleDateString()}</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            {!alert.is_resolved && (
              <button
                onClick={() => onResolve(alert.id)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600/50 bg-ink-800/40 px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark resolved
              </button>
            )}
            <button
              onClick={() => onDelete(alert.id)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-ink-600/50 bg-ink-800/40 px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:border-red-400/40 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
