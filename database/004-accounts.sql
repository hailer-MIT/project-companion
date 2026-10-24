-- Bright Path Tutors account schema for the existing Neon database.
-- Additive only. Managed neon_auth tables and existing bot records are untouched.
-- Run once as the database owner. Runtime calls are server-only and authorized
-- individually; no browser or public database grants are made.
create table if not exists public.bpt_user (
 id uuid primary key, name text not null, email text not null unique,
 "emailVerified" boolean not null default false, image text,
 "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create unique index if not exists bpt_user_email_normalized on public.bpt_user(lower(email));
create table if not exists public.bpt_session (
 id uuid primary key, "expiresAt" timestamptz not null, token text not null unique,
 "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(),
 "ipAddress" text, "userAgent" text, "userId" uuid not null references public.bpt_user(id) on delete cascade
);
create index if not exists bpt_session_user on public.bpt_session("userId");
create table if not exists public.bpt_account (
 id uuid primary key, "accountId" text not null, "providerId" text not null,
 "userId" uuid not null references public.bpt_user(id) on delete cascade,
 "accessToken" text, "refreshToken" text, "idToken" text,
 "accessTokenExpiresAt" timestamptz, "refreshTokenExpiresAt" timestamptz, scope text, password text,
 "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now(),
 unique("providerId","accountId")
);
create index if not exists bpt_account_user on public.bpt_account("userId");
create table if not exists public.bpt_verification (
 id uuid primary key, identifier text not null, value text not null,
 "expiresAt" timestamptz not null, "createdAt" timestamptz not null default now(), "updatedAt" timestamptz not null default now()
);
create index if not exists bpt_verification_identifier on public.bpt_verification(identifier);
create table if not exists public.bpt_rate_limit (
 id uuid primary key, key text not null unique, count integer not null, "lastRequest" bigint not null
);
create table if not exists public.bpt_profiles (
 user_id uuid primary key references public.bpt_user(id) on delete cascade,
 display_name text not null, photo_reference text, preferences jsonb not null default '{"language":"en"}',
 updated_at timestamptz not null default now()
);
create table if not exists public.bpt_roles (
 user_id uuid not null references public.bpt_user(id) on delete cascade,
 role text not null check(role in ('parent','student','tutor','admin')), primary key(user_id,role)
);
create table if not exists public.bpt_family_invitations (
 id uuid primary key default gen_random_uuid(), parent_id uuid not null references public.bpt_user(id) on delete cascade,
 student_email text not null, status text not null default 'pending' check(status in ('pending','accepted','declined')),
 expires_at timestamptz not null default now()+interval '7 days', created_at timestamptz not null default now(),
 unique(parent_id,student_email)
);
create index if not exists bpt_family_invitation_recipient on public.bpt_family_invitations(student_email,status);
create table if not exists public.bpt_family_relationships (
 id uuid primary key default gen_random_uuid(), parent_id uuid not null references public.bpt_user(id) on delete cascade,
 student_id uuid not null references public.bpt_user(id) on delete cascade,
 status text not null default 'accepted' check(status in ('accepted','revoked')),
 created_at timestamptz not null default now(), unique(parent_id,student_id), check(parent_id<>student_id)
);
create index if not exists bpt_family_student on public.bpt_family_relationships(student_id,status);
-- Baseline role/profile creation is atomic with user insertion. No client role input.
create or replace function public.bpt_initialize_profile() returns trigger language plpgsql set search_path=public as $$
begin
 insert into public.bpt_profiles(user_id,display_name) values(new.id,new.name);
 insert into public.bpt_roles(user_id,role) values(new.id,'parent');
 return new;
end; $$;
create or replace trigger bpt_user_created after insert on public.bpt_user for each row execute function public.bpt_initialize_profile();
-- These tables are intentionally server-only. Neon owner access is already granted
-- by ownership; RLS provides no access to unprivileged roles without policies.
alter table public.bpt_user enable row level security;
alter table public.bpt_session enable row level security;
alter table public.bpt_account enable row level security;
alter table public.bpt_verification enable row level security;
alter table public.bpt_rate_limit enable row level security;
alter table public.bpt_profiles enable row level security;
alter table public.bpt_roles enable row level security;
alter table public.bpt_family_invitations enable row level security;
alter table public.bpt_family_relationships enable row level security;