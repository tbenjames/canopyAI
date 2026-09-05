-- Elevate the founder/admin email to the 'admin' role (idempotent, one-shot).
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'admin'::public.app_role
FROM auth.users u
WHERE lower(u.email) = lower('supprttmrnhinitiative@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;