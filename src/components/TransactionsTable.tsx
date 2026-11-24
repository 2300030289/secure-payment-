import { Search, ShieldCheck, AlertTriangle, ArrowUpDown, Trash2, Inbox } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { TransactionWithAlert } from '@/lib/types';

interface TransactionsTableProps {
  transactions: TransactionWithAlert[];
  onDelete: (id: string) => Promise<void>;
}

type SortKey = 'created_at' | 'amount' | 'risk_score';
type FilterKey = 'all' | 'safe' | 'suspicious';

export default function TransactionsTable({ transactions, onDelete }: TransactionsTableProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let rows = [...transactions];
    if (filter !== 'all') rows = rows.filter((t) => t.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (t) =>
          t.transaction_id.toLowerCase().includes(q) ||
          t.customer_user_id.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return rows;
  }, [transactions, filter, query, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <div className="rounded-2xl glass p-5 shadow-card sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Transaction History</h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="input-field pl-9 py-2 text-xs sm:w-56"
              placeholder="Search ID, customer, location…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex rounded-lg bg-ink-900/60 p-0.5">
            {(['all', 'safe', 'suspicious'] as FilterKey[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition ${
                  filter === f ? 'bg-brand-500 text-ink-950' : 'text-slate-300 hover:text-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="mb-3 h-10 w-10 text-slate-600" />
          <p className="text-sm text-slate-400">
            {transactions.length === 0 ? 'No transactions submitted yet.' : 'No transactions match your filters.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink-700/40 text-xs uppercase tracking-wider text-slate-500">
                <th className="px-3 py-3 font-medium">Transaction</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">
                  <button onClick={() => toggleSort('amount')} className="inline-flex items-center gap-1 hover:text-slate-300">
                    Amount <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">
                  <button onClick={() => toggleSort('risk_score')} className="inline-flex items-center gap-1 hover:text-slate-300">
                    Risk <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">
                  <button onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1 hover:text-slate-300">
                    Time <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800/60">
              {filtered.map((t) => (
                <tr key={t.id} className="group transition hover:bg-ink-800/30">
                  <td className="px-3 py-3 font-mono text-xs text-slate-200">{t.transaction_id}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-400">{t.customer_user_id}</td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-200">
                    \u20B9{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-300">{t.location}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-ink-700/60">
                        <div
                          className={`h-full rounded-full ${t.risk_score >= 80 ? 'bg-red-400' : t.risk_score >= 50 ? 'bg-amber-400' : 'bg-brand-400'}`}
                          style={{ width: `${t.risk_score}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-slate-300">{t.risk_score}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    {t.status === 'safe' ? (
                      <span className="chip bg-emerald-500/15 text-emerald-300">
                        <ShieldCheck className="h-3 w-3" /> Safe
                      </span>
                    ) : (
                      <span className="chip bg-amber-500/15 text-amber-300">
                        <AlertTriangle className="h-3 w-3" /> Suspicious
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {new Date(t.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button
                      onClick={() => onDelete(t.id)}
                      className="opacity-0 transition group-hover:opacity-100"
                      title="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-400" />
                    </button>
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
