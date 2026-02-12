create extension if not exists pgcrypto;

create table if not exists public.flowers (
  id uuid primary key default gen_random_uuid(),
  x_position double precision not null check (x_position >= 0 and x_position <= 100),
  y_position double precision not null check (y_position >= 0 and y_position <= 100),
  color_hex varchar(10) not null,
  visual_type integer not null check (visual_type between 1 and 3),
  scale double precision not null check (scale >= 0.5 and scale <= 2),
  bloom_delay integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  flower_id uuid not null references public.flowers(id) on delete cascade,
  access_token_hash varchar(64) not null unique,
  sender_name varchar(100) not null,
  recipient_name varchar(100) not null,
  content_encrypted bytea not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.messages add column if not exists access_token_hash varchar(64);
alter table public.messages add column if not exists content_encrypted bytea;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'access_token'
  ) then
    execute $migrate$
      update public.messages
      set
        access_token_hash = coalesce(access_token_hash, encode(extensions.digest(access_token, 'sha256'), 'hex')),
        content_encrypted = coalesce(content_encrypted, extensions.pgp_sym_encrypt(content, access_token))
      where access_token is not null
    $migrate$;
  end if;
end $$;

alter table public.messages alter column access_token_hash set not null;
alter table public.messages alter column content_encrypted set not null;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'access_token'
  ) then
    alter table public.messages drop column access_token;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'messages'
      and column_name = 'content'
  ) then
    alter table public.messages drop column content;
  end if;
end $$;

create index if not exists idx_messages_access_token_hash on public.messages(access_token_hash);
create index if not exists idx_messages_sender_created_at on public.messages(sender_name, created_at desc);
drop index if exists public.idx_messages_access_token;
drop index if exists public.idx_messages_user_created_at;
drop index if exists public.idx_messages_sender_email_created_at;
create index if not exists idx_flowers_created_at on public.flowers(created_at desc);

alter table public.messages drop column if exists user_id;
alter table public.messages drop constraint if exists messages_sender_email_required_chk;
alter table public.messages drop column if exists sender_email;

alter table public.flowers enable row level security;
alter table public.messages enable row level security;

drop policy if exists "public_can_view_flowers" on public.flowers;
create policy "public_can_view_flowers"
on public.flowers
for select
to anon, authenticated
using (true);

revoke all on table public.flowers from anon, authenticated;
grant select on table public.flowers to anon, authenticated;

revoke all on table public.messages from anon, authenticated;

create or replace function public.plant_message(
  p_sender_name text,
  p_recipient_name text,
  p_content text
)
returns table (
  token text,
  id uuid,
  x_position double precision,
  y_position double precision,
  color_hex text,
  visual_type integer,
  scale double precision,
  bloom_delay integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flower public.flowers%rowtype;
  v_token text;
  v_token_hash text;
  v_sender_name text;
  v_recipient_name text;
  v_recent_count integer;
  v_colors text[] := array[
    '#fce4ec',
    '#f8bbd0',
    '#f48fb1',
    '#f06292',
    '#ec407a',
    '#e1bee7',
    '#ce93d8',
    '#fff9c4',
    '#fff59d'
  ];
begin
  v_sender_name := trim(p_sender_name);
  v_recipient_name := trim(p_recipient_name);

  if v_sender_name is null or length(v_sender_name) = 0 then
    raise exception 'Sender is required';
  end if;
  if length(v_sender_name) > 100 then
    raise exception 'Sender must be 100 characters or fewer';
  end if;
  if v_recipient_name is null or length(v_recipient_name) = 0 then
    raise exception 'Recipient is required';
  end if;
  if length(v_recipient_name) > 100 then
    raise exception 'Recipient must be 100 characters or fewer';
  end if;
  if p_content is null or length(trim(p_content)) = 0 then
    raise exception 'Message content is required';
  end if;
  if length(p_content) > 500 then
    raise exception 'Message content must be 500 characters or fewer';
  end if;

  select count(*)
  into v_recent_count
  from public.messages m
  where m.sender_name = v_sender_name
    and m.created_at >= now() - interval '15 minutes';

  if v_recent_count >= 5 then
    raise exception 'Too many messages. Please wait and try again.';
  end if;

  insert into public.flowers (x_position, y_position, color_hex, visual_type, scale, bloom_delay)
  values (
    5 + random() * 90,
    10 + random() * 60,
    v_colors[1 + floor(random() * array_length(v_colors, 1))::integer],
    1 + floor(random() * 3)::integer,
    0.8 + random() * 0.4,
    0
  )
  returning * into v_flower;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

  insert into public.messages (flower_id, access_token_hash, sender_name, recipient_name, content_encrypted)
  values (
    v_flower.id,
    v_token_hash,
    v_sender_name,
    v_recipient_name,
    extensions.pgp_sym_encrypt(p_content, v_token)
  );

  return query
  select
    v_token,
    v_flower.id,
    v_flower.x_position,
    v_flower.y_position,
    v_flower.color_hex::text,
    v_flower.visual_type,
    v_flower.scale,
    v_flower.bloom_delay;
end;
$$;

create or replace function public.get_message_by_token(
  p_access_token text
)
returns table (
  token text,
  sender text,
  recipient text,
  content text,
  created_at timestamptz,
  id uuid,
  x_position double precision,
  y_position double precision,
  color_hex text,
  visual_type integer,
  scale double precision,
  bloom_delay integer
)
language sql
security definer
set search_path = public
as $$
  select
    p_access_token as token,
    m.sender_name::text as sender,
    m.recipient_name::text as recipient,
    extensions.pgp_sym_decrypt(m.content_encrypted, p_access_token) as content,
    m.created_at,
    f.id,
    f.x_position,
    f.y_position,
    f.color_hex::text,
    f.visual_type,
    f.scale,
    f.bloom_delay
  from public.messages m
  join public.flowers f on f.id = m.flower_id
  where m.access_token_hash = encode(extensions.digest(p_access_token, 'sha256'), 'hex')
    and p_access_token ~ '^[0-9a-f]{64}$'
  limit 1;
$$;

drop function if exists public.plant_message(text, text, text, text);
revoke all on function public.plant_message(text, text, text) from public;
revoke all on function public.get_message_by_token(text) from public;
grant execute on function public.plant_message(text, text, text) to anon, authenticated;
grant execute on function public.get_message_by_token(text) to anon, authenticated;
