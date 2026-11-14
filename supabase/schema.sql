-- Ретро: things for sale, their photos and who may change them.
-- Run once in Supabase → SQL Editor. Safe to run again.

-- Who may edit. Add the owner's e-mail after creating his user in Authentication → Users.
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies: the table is readable only through is_admin() below.

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins where email = (auth.jwt() ->> 'email'));
$$;

create table if not exists public.items (
  id          text primary key,
  name        text not null check (char_length(name) between 1 and 120),
  category    text not null check (category in ('porcelain', 'china', 'bronze', 'tableware', 'busts')),
  origin      text not null default '',
  description text not null default '',
  -- Tenge; null means «по запросу».
  price       integer check (price is null or price >= 0),
  -- Real height: the shelf on the home page turns it into pixels.
  height_cm   numeric(5, 1) not null default 20 check (height_cm > 0),
  -- Public URL of the cut-out photo (or a path on the site for the bundled samples).
  image       text not null,
  image_w     integer not null,
  image_h     integer not null,
  -- Place on the category's shelf in the sideboard, 1–3; null keeps it in the catalogue only.
  shelf       smallint check (shelf between 1 and 3),
  sold        boolean not null default false,
  added_at    date not null default current_date,
  updated_at  timestamptz not null default now(),
  constraint items_one_per_slot unique (category, shelf)
);

alter table public.items enable row level security;

-- Table access for the API roles (newer projects may not grant it automatically); RLS below still decides rows.
grant select on public.items to anon, authenticated;
grant insert, update, delete on public.items to authenticated;

drop policy if exists "Anyone can read items" on public.items;
create policy "Anyone can read items" on public.items for select using (true);

drop policy if exists "Admins write items" on public.items;
create policy "Admins write items" on public.items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists items_touch on public.items;
create trigger items_touch before update on public.items
  for each row execute function public.touch_updated_at();

-- Puts exactly these things on a category's shelf, left to right, in one transaction,
-- so swapping two things never trips the one-per-slot rule. Runs with the caller's rights: RLS applies.
create or replace function public.set_shelf(shelf_category text, item_ids text[]) returns void
language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.items set shelf = null where category = shelf_category and shelf is not null;
  update public.items i
     set shelf = picked.slot
    from unnest(item_ids[1:3]) with ordinality as picked(id, slot)
   where i.id = picked.id and i.category = shelf_category;
end $$;

-- Photos: a public bucket, writable by admins only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('items', 'items', true, 2097152, array['image/webp', 'image/png', 'image/jpeg'])
on conflict (id) do nothing;

-- Reading through the API (not the public URL) is needed to delete a replaced photo.
drop policy if exists "Admins read item photos" on storage.objects;
create policy "Admins read item photos" on storage.objects for select to authenticated
  using (bucket_id = 'items' and public.is_admin());

drop policy if exists "Admins upload item photos" on storage.objects;
create policy "Admins upload item photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'items' and public.is_admin());

drop policy if exists "Admins change item photos" on storage.objects;
create policy "Admins change item photos" on storage.objects for update to authenticated
  using (bucket_id = 'items' and public.is_admin());

drop policy if exists "Admins delete item photos" on storage.objects;
create policy "Admins delete item photos" on storage.objects for delete to authenticated
  using (bucket_id = 'items' and public.is_admin());
