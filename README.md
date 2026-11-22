# Nildo Shoes

Vitrine de calçados com pedido pelo WhatsApp e painel para os administradores publicarem os anúncios.

- **Vitrine** (`/`): promoções, filtros por categoria, numeração, marca e preço, carrossel de fotos e botão que abre o WhatsApp com o pedido escrito.
- **Painel** (`/admin`): login, criar, editar, pausar e excluir anúncios, com envio de fotos.

Feito com React + Vite, Supabase (banco, login e fotos) e hospedagem na Vercel.

## Configurar o Supabase (uma vez)

1. No SQL Editor, rode o arquivo [`supabase/schema.sql`](supabase/schema.sql).
2. Em **Authentication > Sign In / Providers > Email**, desligue **Allow new users to sign up**.
3. Em **Authentication > Users > Add user**, crie as duas contas de administrador (marque *Auto Confirm User*).
4. Rode o comando do fim do `schema.sql` com os dois e-mails. Ele libera o painel só para essas contas, e o banco recusa uma terceira.

A segurança está nas regras do banco (RLS): visitantes só leem anúncios ativos e só quem está na tabela `admins` grava produtos e fotos.

## Rodar no computador

```bash
npm install
cp .env.example .env   # e coloque a chave publishable do Supabase
npm run dev
```

## Publicar na Vercel

1. Importe este repositório na Vercel (o framework Vite é detectado sozinho).
2. Em **Settings > Environment Variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Faça o deploy. O `vercel.json` já faz a rota `/admin` funcionar.

## Onde mudar as coisas

- Número do WhatsApp, nome da loja e parcelas: [`src/config.js`](src/config.js)
- Cores e fontes: topo de [`src/styles/global.css`](src/styles/global.css)
- Categorias: tabela `categorias` no Supabase
