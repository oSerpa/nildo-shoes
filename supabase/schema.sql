-- Loja de Calçados: estrutura do banco no Supabase
-- Rodar no SQL Editor do Supabase, de uma vez.

-- Categorias e marcas ficam em tabelas próprias pra alimentar os filtros
create table public.categorias (
  id    bigint generated always as identity primary key,
  nome  text not null unique
);

create table public.marcas (
  id    bigint generated always as identity primary key,
  nome  text not null unique
);

create table public.produtos (
  id            uuid primary key default gen_random_uuid(),
  nome          text not null,
  descricao     text,
  preco         numeric(10,2) not null check (preco >= 0),
  preco_promocional numeric(10,2) check (preco_promocional >= 0 and preco_promocional < preco),
                                                   -- preenchido = produto aparece no carrossel de promoções
  categoria_id  bigint references public.categorias(id) on delete set null,
  marca_id      bigint references public.marcas(id) on delete set null,
  tamanhos      smallint[] not null default '{}',  -- ex: {37,38,39}
  fotos         text[] not null default '{}',      -- caminhos no bucket, na ordem do carrossel
  ativo         boolean not null default true,     -- false = anúncio pausado
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index produtos_ativo_idx     on public.produtos (ativo);
create index produtos_categoria_idx on public.produtos (categoria_id);
create index produtos_marca_idx     on public.produtos (marca_id);
create index produtos_tamanhos_idx  on public.produtos using gin (tamanhos);

-- Atualiza atualizado_em sozinho
create function public.set_atualizado_em() returns trigger
language plpgsql as $$
begin
  new.atualizado_em = now();
  return new;
end $$;

create trigger produtos_atualizado_em
  before update on public.produtos
  for each row execute function public.set_atualizado_em();

-- Administradores: no máximo duas contas podem publicar
-- Só o painel do Supabase (service role) mexe nesta tabela; pela API ninguém lê nem altera.
create table public.admins (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  email     text not null unique,
  criado_em timestamptz not null default now()
);
alter table public.admins enable row level security;  -- sem policies = fechada pra API

create function public.limite_admins() returns trigger
language plpgsql as $$
begin
  if (select count(*) from public.admins) >= 2 then
    raise exception 'Limite de 2 administradores atingido';
  end if;
  return new;
end $$;

create trigger admins_limite
  before insert on public.admins
  for each row execute function public.limite_admins();

-- true só se quem está logado está na lista de admins
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Permissões (RLS)
-- Visitante: só lê anúncios ativos, categorias e marcas.
-- Admin: faz tudo. Estar logado não basta, a conta precisa estar em public.admins.
alter table public.produtos   enable row level security;
alter table public.categorias enable row level security;
alter table public.marcas     enable row level security;

create policy "publico le ativos" on public.produtos
  for select using (ativo = true);
create policy "admin gerencia produtos" on public.produtos
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "publico le categorias" on public.categorias
  for select using (true);
create policy "admin gerencia categorias" on public.categorias
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "publico le marcas" on public.marcas
  for select using (true);
create policy "admin gerencia marcas" on public.marcas
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Bucket das fotos: leitura pública, escrita só de admin, até 5 MB, só imagem
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos-produtos', 'fotos-produtos', true, 5242880,
        array['image/jpeg','image/png','image/webp']);

create policy "admin envia fotos" on storage.objects
  for insert to authenticated with check (bucket_id = 'fotos-produtos' and public.is_admin());
create policy "admin altera fotos" on storage.objects
  for update to authenticated using (bucket_id = 'fotos-produtos' and public.is_admin());
create policy "admin apaga fotos" on storage.objects
  for delete to authenticated using (bucket_id = 'fotos-produtos' and public.is_admin());

-- Dados iniciais pra testar os filtros
insert into public.categorias (nome) values
  ('Tênis'), ('Sapatênis'), ('Social'), ('Bota'), ('Sandália'), ('Chinelo');

-- DEPOIS de rodar este arquivo:
-- 1. Authentication > Sign In / Providers > Email: desligar "Allow new users to sign up".
-- 2. Authentication > Users > Add user: criar as duas contas (e-mail + senha forte).
-- 3. Rodar:
--    insert into public.admins (user_id, email)
--    select id, email from auth.users where email in ('email1@exemplo.com', 'email2@exemplo.com');  -- troque pelos e-mails reais
