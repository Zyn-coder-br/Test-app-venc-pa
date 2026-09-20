-- Ativa a transmissão em tempo real para a operação da equipe.
-- Execute uma vez no SQL Editor do Supabase.

alter table public.batches replica identity full;
alter table public.batch_products replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'batches'
  ) then
    execute 'alter publication supabase_realtime add table public.batches';
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'batch_products'
  ) then
    execute 'alter publication supabase_realtime add table public.batch_products';
  end if;
end $$;
