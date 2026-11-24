import { Users, Shield, User, Mail, Inbox } from 'lucide-react';
import type { Profile } from '@/lib/types';

interface UsersPanelProps {
  profiles: Profile[];
  transactionCounts: Map<string, number>;
}

export default function UsersPanel({ profiles, transactionCounts }: UsersPanelProps) {
  const admins = profiles.filter((p) => p.role === 'admin');
  const analysts = profiles.filter((p) => p.role === 'analyst');

  return (
    <div className="rounded-2xl glass p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-brand-300" />
          <h2 className="text-lg font-semibold text-slate-100">Registered Users</h2>
        </div>
        <div className="flex gap-2">
          <span className="chip bg-brand-500/15 text-brand-300">
            <Shield className="h-3 w-3" /> {admins.length} admin{admins.length !== 1 ? 's' : ''}
          </span>
          <span className="chip bg-ink-700/40 text-slate-300">
            <User className="h-3 w-3" /> {analysts.length} analyst{analysts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {profiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">No registered users yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700/40 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3 font-medium">User</th>
                <th className="px-3 py-3 font-medium">Role</th>
                <th className="px-3 py-3 font-medium">Transactions</th>
                <th className="px-3 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/60">
              {profiles.map((p) => (
                <tr key={p.id} className="transition hover:bg-ink-800/30">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0 text-slate-600" />
                      <span className="text-xs text-slate-200">{p.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {p.role === 'admin' ? (
                      <span className="chip bg-brand-500/15 text-brand-300">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="chip bg-ink-700/40 text-slate-300">
                        <User className="h-3 w-3" /> Analyst
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-300">
                    {transactionCounts.get(p.id) ?? 0}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {new Date(p.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
