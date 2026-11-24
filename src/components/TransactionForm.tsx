import { useState, type FormEvent } from 'react';
import { Send, Loader2, MapPin, IndianRupee, Hash, User, Sparkles } from 'lucide-react';
import RiskGauge from './RiskGauge';
import { assessRisk, severityForScore } from '@/lib/risk';
import type { RiskResult } from '@/lib/types';

interface TransactionFormProps {
  onSubmit: (input: {
    transaction_id: string;
    customer_user_id: string;
    amount: number;
    location: string;
    risk: RiskResult;
  }) => Promise<void>;
}

export default function TransactionForm({ onSubmit }: TransactionFormProps) {
  const [transactionId, setTransactionId] = useState('');
  const [customerUserId, setCustomerUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [preview, setPreview] = useState<RiskResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function computePreview() {
    if (!transactionId || !customerUserId || !amount) {
      setPreview(null);
      return;
    }
    setPreview(
      assessRisk({
        transaction_id: transactionId,
        customer_user_id: customerUserId,
        amount: Number(amount) || 0,
        location,
      }),
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const numericAmount = Number(amount);
    if (!transactionId.trim() || !customerUserId.trim() || !numericAmount || numericAmount <= 0) {
      setError('Please fill in all fields with valid values.');
      return;
    }
    const risk = assessRisk({
      transaction_id: transactionId,
      customer_user_id: customerUserId,
      amount: numericAmount,
      location,
    });
    setBusy(true);
    try {
      await onSubmit({
        transaction_id: transactionId.trim(),
        customer_user_id: customerUserId.trim(),
        amount: numericAmount,
        location: location.trim() || 'Unknown',
        risk,
      });
      setTransactionId('');
      setCustomerUserId('');
      setAmount('');
      setLocation('');
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit transaction.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl glass p-5 shadow-card sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-300" />
        <h2 className="text-lg font-semibold text-slate-100">Submit Transaction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field icon={Hash} label="Transaction ID" >
            <input
              className="input-field pl-10"
              placeholder="TXN-2024-08821"
              value={transactionId}
              onChange={(e) => { setTransactionId(e.target.value); setTimeout(computePreview, 0); }}
            />
          </Field>
          <Field icon={User} label="Customer ID">
            <input
              className="input-field pl-10"
              placeholder="USR-51234"
              value={customerUserId}
              onChange={(e) => { setCustomerUserId(e.target.value); setTimeout(computePreview, 0); }}
            />
          </Field>
          <Field icon={IndianRupee} label="Amount (INR)">
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="input-field pl-10"
              placeholder="0.00"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setTimeout(computePreview, 0); }}
            />
          </Field>
          <Field icon={MapPin} label="Location">
            <input
              className="input-field pl-10"
              placeholder="New York, US"
              value={location}
              onChange={(e) => { setLocation(e.target.value); setTimeout(computePreview, 0); }}
            />
          </Field>
        </div>

        {preview && (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-ink-600/40 bg-ink-900/40 p-4 sm:flex-row sm:items-center sm:gap-5">
            <RiskGauge score={preview.score} size={96} />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-slate-200">
                Live risk preview
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Status: <span className={preview.status === 'suspicious' ? 'text-amber-400' : 'text-brand-300'}>{preview.status.toUpperCase()}</span>
                {preview.status === 'suspicious' && <> · Severity: {severityForScore(preview.score)}</>}
              </p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                {preview.risk_factors.map((f) => (
                  <span key={f} className="chip bg-ink-800/70 text-slate-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>
        )}

        <button type="submit" disabled={busy} className="btn-primary w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {busy ? 'Submitting…' : 'Submit & Analyze Transaction'}
        </button>
      </form>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Hash;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-400">{label}</label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        {children}
      </div>
    </div>
  );
}
