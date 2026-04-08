-- =============================================================================
-- RLS Security Fix Migration
-- Supabase project: yixsbgjzwmzycrroplyp
--
-- Problem: NEXT_PUBLIC_SUPABASE_ANON_KEY is exposed in client bundles,
--          allowing direct REST API access to all tables.
--
-- Solution:
--   1. Enable Row Level Security on all public tables.
--   2. Deny-all policy for the `anon` role (unauthenticated REST requests).
--   3. Full-access policy for the `service_role` (used by Prisma via DATABASE_URL).
--
-- NOTE: Prisma connects via postgres/service_role credentials in DATABASE_URL,
--       not via the anon key. These policies do NOT affect Prisma queries.
-- =============================================================================

-- -----------------------------------------------------------------------
-- users
-- -----------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.users;
CREATE POLICY "deny_anon"
  ON public.users
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.users;
CREATE POLICY "service_role_full"
  ON public.users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- accounts
-- -----------------------------------------------------------------------
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.accounts;
CREATE POLICY "deny_anon"
  ON public.accounts
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.accounts;
CREATE POLICY "service_role_full"
  ON public.accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- sessions
-- -----------------------------------------------------------------------
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.sessions;
CREATE POLICY "deny_anon"
  ON public.sessions
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.sessions;
CREATE POLICY "service_role_full"
  ON public.sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- verification_tokens
-- -----------------------------------------------------------------------
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.verification_tokens;
CREATE POLICY "deny_anon"
  ON public.verification_tokens
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.verification_tokens;
CREATE POLICY "service_role_full"
  ON public.verification_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- loan_plans
-- -----------------------------------------------------------------------
ALTER TABLE public.loan_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.loan_plans;
CREATE POLICY "deny_anon"
  ON public.loan_plans
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.loan_plans;
CREATE POLICY "service_role_full"
  ON public.loan_plans
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- budget_accounts
-- -----------------------------------------------------------------------
ALTER TABLE public.budget_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.budget_accounts;
CREATE POLICY "deny_anon"
  ON public.budget_accounts
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.budget_accounts;
CREATE POLICY "service_role_full"
  ON public.budget_accounts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- budget_categories
-- -----------------------------------------------------------------------
ALTER TABLE public.budget_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.budget_categories;
CREATE POLICY "deny_anon"
  ON public.budget_categories
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.budget_categories;
CREATE POLICY "service_role_full"
  ON public.budget_categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- transactions
-- -----------------------------------------------------------------------
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.transactions;
CREATE POLICY "deny_anon"
  ON public.transactions
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.transactions;
CREATE POLICY "service_role_full"
  ON public.transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- recurring_expenses
-- -----------------------------------------------------------------------
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.recurring_expenses;
CREATE POLICY "deny_anon"
  ON public.recurring_expenses
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.recurring_expenses;
CREATE POLICY "service_role_full"
  ON public.recurring_expenses
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- savings_goals
-- -----------------------------------------------------------------------
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.savings_goals;
CREATE POLICY "deny_anon"
  ON public.savings_goals
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.savings_goals;
CREATE POLICY "service_role_full"
  ON public.savings_goals
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------------------------------
-- savings_contributions
-- -----------------------------------------------------------------------
ALTER TABLE public.savings_contributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deny_anon" ON public.savings_contributions;
CREATE POLICY "deny_anon"
  ON public.savings_contributions
  FOR ALL
  TO anon
  USING (false);

DROP POLICY IF EXISTS "service_role_full" ON public.savings_contributions;
CREATE POLICY "service_role_full"
  ON public.savings_contributions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
