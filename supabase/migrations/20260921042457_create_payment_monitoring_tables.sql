/*
# Create secure payment monitoring tables

1. New Tables
- `transactions` stores each payment submitted for review, including transaction ID, user ID, amount, location, risk score, status, and review timestamps.
- `transaction_alerts` stores a review alert for each suspicious transaction, including a title, message, severity, and resolution state.

2. Security
- Row Level Security is enabled on both tables.
- Signed-in users can only read and manage transactions and alerts they own.
- Alerts are scoped through their parent transaction, so a user cannot access another user's alert.

3. Important Notes
- `user_id` defaults to the currently signed-in user, so the browser does not need to supply ownership data.
- Risk decisions are stored with the submitted transaction for consistent dashboard history.
*/

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_id text NOT NULL,
  customer_user_id text NOT NULL,
  amount numeric(12, 2) NOT NULL CHECK (amount > 0),
  location text NOT NULL,
  risk_score integer NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  status text NOT NULL CHECK (status IN ('safe', 'suspicious')),
  risk_factors text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transactions_user_created_idx ON public.transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON public.transactions(user_id, status);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own transactions" ON public.transactions;
CREATE POLICY "Users can create own transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.transaction_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'high' CHECK (severity IN ('medium', 'high', 'critical')),
  is_resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS transaction_alerts_user_created_idx ON public.transaction_alerts(user_id, created_at DESC);

ALTER TABLE public.transaction_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON public.transaction_alerts;
CREATE POLICY "Users can view own alerts" ON public.transaction_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own alerts" ON public.transaction_alerts;
CREATE POLICY "Users can create own alerts" ON public.transaction_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.transactions WHERE transactions.id = transaction_alerts.transaction_id AND transactions.user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own alerts" ON public.transaction_alerts;
CREATE POLICY "Users can update own alerts" ON public.transaction_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON public.transaction_alerts;
CREATE POLICY "Users can delete own alerts" ON public.transaction_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);
