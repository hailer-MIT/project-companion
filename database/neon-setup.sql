-- Bright Path Tutors: one-time Neon setup. Paste into Neon -> SQL Editor -> Run.
-- Safe to run again (skips anything that already exists).

create table if not exists telegram_chats (
  chat_id bigint primary key,
  first_name text,
  username text,
  is_admin boolean not null default false, -- legacy, untrusted; never used for permissions
  pending_action text,
  linked_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

create table if not exists telegram_messages (
  update_id bigint primary key,
  chat_id bigint not null,
  text text,
  raw_update jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists idx_telegram_messages_chat_id on telegram_messages (chat_id);

create table if not exists tutor_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  telegram text,
  subjects text[] not null default '{}',
  years_experience int,
  bio text,
  references_text text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists bot_requests (
  id uuid primary key default gen_random_uuid(),
  chat_id bigint not null,
  kind text not null,
  body text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists idx_bot_requests_open on bot_requests (status, created_at);
