import { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck,
  LogOut,
  Loader2,
  LayoutDashboard,
  ArrowLeftRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type {
  Transaction,
  TransactionAlert,
  AdminTransaction,
  AdminAlert,
  Profile,
} from '@/lib/types';
import AdminMetricCards from './AdminMetricCards';
import AdminTransactionsTable from './AdminTransactionsTable';
import AdminAlertsPanel from './AdminAlertsPanel';
import UsersPanel from './UsersPanel';

interface AdminDashboardProps {
  onSwitchToAnalyst: () => void;
}

export default function AdminDashboard({ onSwitchToAnalyst }: AdminDashboardProps) {
  const { user, signOut } = useAuth();
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [txRes, alertRes, profileRes] = await Promise.all([
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('transaction_alerts').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    ]);

    if (txRes.error) console.error(txRes.error);
    if (alertRes.error) console.error(alertRes.error);
    if (profileRes.error) console.error(profileRes.error);

    const profilesById = new Map(
      ((profileRes.data as Profile[]) ?? []).map((p) => [p.id, p]),
    );

    const enrichedTxns: AdminTransaction[] = ((txRes.data as Transaction[]) ?? []).map((t) => ({
      ...t,
      user_email: profilesById.get(t.user_id)?.email,
    }));

    const enrichedAlerts: AdminAlert[] = ((alertRes.data as TransactionAlert[]) ?? []).map((a) => ({
      ...a,
      user_email: profilesById.get(a.user_id)?.email,
    }));

    setTransactions(enrichedTxns);
    setAlerts(enrichedAlerts);
    setProfiles((profileRes.data as Profile[]) ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadData();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [loadData]);

  const suspicious = transactions.filter((t) => t.status === 'suspicious').length;
  const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const activeAlerts = alerts.filter((a) => !a.is_resolved).length;
  const avgRisk = transactions.length
    ? transactions.reduce((sum, t) => sum + t.risk_score, 0) / transactions.length
    : 0;

  const txnCounts = new Map<string, number>();
  for (const t of transactions) {
    txnCounts.set(t.user_id, (txnCounts.get(t.user_id) ?? 0) + 1);
  }

  async function handleResolveAlert(id: string) {
    const { error } = await supabase.from('transaction_alerts').update({ is_resolved: true }).eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_resolved: true } : a)));
  }

  async function handleDeleteAlert(id: string) {
    const { error } = await supabase.from('transaction_alerts').delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  async function handleDeleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setAlerts((prev) => prev.filter((a) => a.transaction_id !== id));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950">
        <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 bg-grid">
      <header className="sticky top-0 z-20 border-b border-ink-800/60 bg-ink-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-brand-400/40">
              <ShieldCheck className="h-5 w-5 text-brand-300" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-50">
                Sentinel<span className="text-gradient">Pay</span>
                <span className="ml-2 chip bg-brand-500/15 text-brand-300">Admin</span>
              </p>
              <p className="text-[10px] text-slate-500">System-wide Monitoring Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onSwitchToAnalyst}
              className="btn-ghost !px-3 !py-2"
              title="Switch to analyst view"
            >
              <ArrowLeftRight className="h-4 w-4" />
              <span className="hidden sm:inline">Analyst View</span>
            </button>
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-300">{user?.email}</p>
              <p className="text-[10px] text-brand-400">Administrator</p>
            </div>
            <button onClick={signOut} className="btn-ghost !px-3 !py-2" title="Sign out">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-brand-300" />
            <h1 className="text-xl font-bold text-slate-50 sm:text-2xl">Admin Dashboard</h1>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Monitor all transactions, alerts, and users across the entire system.
          </p>
        </div>

        <div className="mb-6 animate-fade-up" style={{ animationDelay: '40ms' }}>
          <AdminMetricCards
            totalTransactions={transactions.length}
            suspicious={suspicious}
            totalUsers={profiles.length}
            totalVolume={totalVolume}
            activeAlerts={activeAlerts}
            avgRisk={avgRisk}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              <AdminTransactionsTable transactions={transactions} onDelete={handleDeleteTransaction} />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <UsersPanel profiles={profiles} transactionCounts={txnCounts} />
            </div>
          </div>
          <div className="animate-fade-up lg:col-span-1" style={{ animationDelay: '160ms' }}>
            <div className="lg:sticky lg:top-20">
              <AdminAlertsPanel
                alerts={alerts}
                onResolve={handleResolveAlert}
                onDelete={handleDeleteAlert}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
