alter table public.telegram_chats add column if not exists is_admin boolean not null default false;
alter table public.telegram_chats add column if not exists pending_action text;

create table if not exists public.bot_requests (
  id uuid primary key default gen_random_uuid(),
  chat_id bigint not null,
  kind text not null,
  body text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);
create index if not exists idx_bot_requests_open on public.bot_requests (status, created_at);

grant all on public.bot_requests to service_role;
alter table public.bot_requests enable row level security;