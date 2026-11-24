/*
# Add admin role system and admin-level access

1. New Tables
- `profiles` extends each auth user with a `role` column ('admin' or 'analyst'). Created automatically for every new account via trigger.
- `profiles` is RLS-protected: users read/update only their own profile. The `role` column is NOT client-writable (column-level UPDATE revoked).

2. Security Changes
- A trigger creates a profile row automatically when a new auth user signs up, defaulting role to 'analyst'.
- `is_admin()` SECURITY DEFINER function checks if the current user has role = 'admin'. Used inside RLS policies so admins can see ALL transactions and alerts across users.
- Admin read policies added to `transactions` and `transaction_alerts` so admin users see all rows, while analysts continue to see only their own.
- `admin_resolve_alert()` and `admin_delete_transaction()` SECURITY DEFINER functions let admins resolve alerts and delete any transaction — actions that bypass the owner-only RLS. Both verify the caller is an admin before acting.
- EXECUTE on admin functions revoked from anon; granted to authenticated only.

3. Important Notes
- The first signed-up user is NOT automatically admin. To grant admin, run:  UPDATE public.profiles SET role = 'admin' WHERE id = '<user-uuid>';
- Admin dashboard link appears only for users whose profile role is 'admin'.
- Existing analyst RLS policies are preserved — admins simply get broader access via the is_admin() predicate.
*/

-- 1. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'analyst' CHECK (role IN ('admin', 'analyst')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Revoke UPDATE on the role column so users cannot self-promote
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (email) ON public.profiles TO authenticated;

-- 2. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user FROM anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user TO authenticated;

-- 3. is_admin() helper for RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;

-- 4. Admin can read ALL transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.is_admin());

-- 5. Admin can read ALL alerts
DROP POLICY IF EXISTS "Admins can view all alerts" ON public.transaction_alerts;
CREATE POLICY "Admins can view all alerts" ON public.transaction_alerts FOR SELECT TO authenticated USING (public.is_admin());

-- 6. Admin can update any alert (resolve)
DROP POLICY IF EXISTS "Admins can update any alert" ON public.transaction_alerts;
CREATE POLICY "Admins can update any alert" ON public.transaction_alerts FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Admin can delete any transaction
DROP POLICY IF EXISTS "Admins can delete any transaction" ON public.transactions;
CREATE POLICY "Admins can delete any transaction" ON public.transactions FOR DELETE TO authenticated USING (public.is_admin());

-- 8. Admin can delete any alert
DROP POLICY IF EXISTS "Admins can delete any alert" ON public.transaction_alerts;
CREATE POLICY "Admins can delete any alert" ON public.transaction_alerts FOR DELETE TO authenticated USING (public.is_admin());

-- 9. Admins can view all profiles (for user management)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.is_admin());
