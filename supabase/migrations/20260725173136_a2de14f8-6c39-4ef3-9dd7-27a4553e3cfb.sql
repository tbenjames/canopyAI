create table public.partner_inquiries (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz not null default now(),
    status text not null default 'new' check (status in ('new', 'reviewed', 'replied', 'archived')),
    organisation_name text not null,
    contact_name text not null,
    email text not null,
    partnership_type text not null check (partnership_type in ('ngo_pilot', 'research_collab', 'government', 'carbon_project', 'donor_funding', 'enterprise', 'other')),
    country text not null default '',
    message text not null,
    website text null,
    estimated_sites int null check (estimated_sites >= 0),
    honeypot text null
);

grant select, insert on public.partner_inquiries to anon;
grant select, insert on public.partner_inquiries to authenticated;
grant all on public.partner_inquiries to service_role;

alter table public.partner_inquiries enable row level security;

create policy "Anyone can submit a partner inquiry"
on public.partner_inquiries
for insert
with check (
    coalesce(honeypot, '') = ''
);

create policy "Users can view their own inquiry by email"
on public.partner_inquiries
for select
using (
    auth.jwt() ->> 'email' = email
    or exists (
        select 1 from public.user_roles
        where user_id = auth.uid()
          and role = 'admin'
    )
);