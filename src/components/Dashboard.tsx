import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, LogOut, Loader2, ArrowLeftRight, Shield } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { severityForScore } from '@/lib/risk';
import type { Transaction, TransactionAlert, TransactionWithAlert, RiskResult } from '@/lib/types';
import MetricCards from './MetricCards';
import TransactionForm from './TransactionForm';
import AlertsPanel from './AlertsPanel';
import TransactionsTable from './TransactionsTable';

interface DashboardProps {
  onSwitchToAdmin?: () => void;
}

export default function Dashboard({ onSwitchToAdmin }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [alerts, setAlerts] = useState<TransactionAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [txRes, alertRes] = await Promise.all([
      supabase.from('transactions').select('*').order('created_at', { ascending: false }),
      supabase.from('transaction_alerts').select('*').order('created_at', { ascending: false }),
    ]);

    if (txRes.error || alertRes.error) {
      console.error(txRes.error ?? alertRes.error);
    }
    setTransactions((txRes.data as Transaction[]) ?? []);
    setAlerts((alertRes.data as TransactionAlert[]) ?? []);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await loadData();
      if (active) setLoading(false);
    })();
    return () => { active = false; };
  }, [loadData]);

  const alertByTxnId = new Map(alerts.map((a) => [a.transaction_id, a]));
  const enriched: TransactionWithAlert[] = transactions.map((t) => ({
    ...t,
    alert: alertByTxnId.get(t.id) ?? null,
  }));

  const suspicious = transactions.filter((t) => t.status === 'suspicious').length;
  const safe = transactions.filter((t) => t.status === 'safe').length;
  const totalVolume = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const avgRisk = transactions.length
    ? transactions.reduce((sum, t) => sum + t.risk_score, 0) / transactions.length
    : 0;

  async function handleSubmit(input: {
    transaction_id: string;
    customer_user_id: string;
    amount: number;
    location: string;
    risk: RiskResult;
  }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        transaction_id: input.transaction_id,
        customer_user_id: input.customer_user_id,
        amount: input.amount,
        location: input.location,
        risk_score: input.risk.score,
        status: input.risk.status,
        risk_factors: input.risk.risk_factors,
      })
      .select()
      .single();

    if (error) throw error;

    const newTxn = data as Transaction;
    setTransactions((prev) => [newTxn, ...prev]);

    if (input.risk.status === 'suspicious') {
      const severity = severityForScore(input.risk.score);
      const { data: alertData, error: alertError } = await supabase
        .from('transaction_alerts')
        .insert({
          transaction_id: newTxn.id,
          title: `Suspicious transaction ${newTxn.transaction_id}`,
          message: `Risk score ${input.risk.score}/100. Factors: ${input.risk.risk_factors.join('; ')}.`,
          severity,
        })
        .select()
        .single();

      if (alertError) throw alertError;
      setAlerts((prev) => [alertData as TransactionAlert, ...prev]);
    }
  }

  async function handleResolveAlert(id: string) {
    const { error } = await supabase
      .from('transaction_alerts')
      .update({ is_resolved: true })
      .eq('id', id);
    if (error) {
      console.error(error);
      return;
    }
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_resolved: true } : a)));
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
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 ring-1 ring-brand-400/30">
              <ShieldCheck className="h-5 w-5 text-brand-300" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-50">
                Sentinel<span className="text-gradient">Pay</span>
              </p>
              <p className="text-[10px] text-slate-500">Payment Monitoring Console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="btn-ghost !px-3 !py-2"
                title="Switch to admin dashboard"
              >
                <Shield className="h-4 w-4 text-brand-300" />
                <span className="hidden sm:inline">Admin View</span>
              </button>
            )}
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-slate-300">{user?.email}</p>
              <p className="text-[10px] text-slate-500">Analyst</p>
            </div>
            <button
              onClick={signOut}
              className="btn-ghost !px-3 !py-2"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 animate-fade-up">
          <h1 className="text-xl font-bold text-slate-50 sm:text-2xl">Monitoring Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">
            Submit payments for risk analysis, review alerts, and track transaction history.
          </p>
        </div>

        <div className="mb-6 animate-fade-up" style={{ animationDelay: '40ms' }}>
          <MetricCards
            total={transactions.length}
            suspicious={suspicious}
            safe={safe}
            totalVolume={totalVolume}
            avgRisk={avgRisk}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="animate-fade-up" style={{ animationDelay: '80ms' }}>
              <TransactionForm onSubmit={handleSubmit} />
            </div>
            <div className="animate-fade-up" style={{ animationDelay: '120ms' }}>
              <TransactionsTable transactions={enriched} onDelete={handleDeleteTransaction} />
            </div>
          </div>
          <div className="animate-fade-up lg:col-span-1" style={{ animationDelay: '160ms' }}>
            <div className="lg:sticky lg:top-20">
              <AlertsPanel alerts={alerts} onResolve={handleResolveAlert} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
