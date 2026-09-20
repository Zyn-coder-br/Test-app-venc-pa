-- Projeto Vencimento PA
-- Etapa: persistência do módulo Promotores no Supabase

create table if not exists public.promotores (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  empresa text not null,
  ativo boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotor_products (
  id uuid primary key default gen_random_uuid(),
  promotor_id uuid not null references public.promotores(id) on delete cascade,
  produto text not null,
  empresa text not null,
  validade date,
  ean text,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create index if not exists promotores_empresa_idx on public.promotores (empresa);
create index if not exists promotor_products_promotor_id_idx on public.promotor_products (promotor_id);
create index if not exists promotor_products_validade_idx on public.promotor_products (validade);

alter table public.promotores enable row level security;
alter table public.promotor_products enable row level security;

drop policy if exists "promotores_select_authenticated" on public.promotores;
create policy "promotores_select_authenticated"
on public.promotores for select
to authenticated
using (true);

drop policy if exists "promotores_insert_authenticated" on public.promotores;
create policy "promotores_insert_authenticated"
on public.promotores for insert
to authenticated
with check (created_by = auth.uid());

drop policy if exists "promotores_update_authenticated" on public.promotores;
create policy "promotores_update_authenticated"
on public.promotores for update
to authenticated
using (true)
with check (true);

drop policy if exists "promotor_products_select_authenticated" on public.promotor_products;
create policy "promotor_products_select_authenticated"
on public.promotor_products for select
to authenticated
using (true);

drop policy if exists "promotor_products_insert_authenticated" on public.promotor_products;
create policy "promotor_products_insert_authenticated"
on public.promotor_products for insert
to authenticated
with check (created_by = auth.uid());

create or replace function public.set_promotores_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_promotores_updated_at on public.promotores;
create trigger set_promotores_updated_at
before update on public.promotores
for each row execute function public.set_promotores_updated_at();
