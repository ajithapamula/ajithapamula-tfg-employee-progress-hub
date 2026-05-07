DROP POLICY IF EXISTS "View own or manager all" ON public.daily_reports;
CREATE POLICY "All authenticated view reports" ON public.daily_reports FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "All authenticated view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);