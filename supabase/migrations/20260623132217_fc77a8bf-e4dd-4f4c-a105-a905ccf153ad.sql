CREATE POLICY "Staff can insert alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Users can view their own feedback" ON public.feedback FOR SELECT TO authenticated USING (auth.uid() = user_id);