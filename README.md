# Projeto Vencimento PA — Etapa 9

Base inicial em React + TypeScript + Vite + Supabase.

## O que já funciona

- Login com Supabase Auth.
- Leitura dos 22 corredores cadastrados.
- Início de uma batida vinculada ao usuário logado.
- Lista exclusiva de produtos da batida ativa.
- Cadastro de produto diretamente em `batch_products`.
- Atualização imediata da lista após salvar, sem recarregar a página.
- Cancelar no cadastro fecha a janela e retorna à batida.
- Finalização da batida.
- Realtime preparado para refletir alterações feitas por outro dispositivo.

## Configuração

1. Copie `.env.example` para `.env`.
2. No Supabase, abra Project Settings > API.
3. Copie somente:
   - Project URL
   - chave pública anon / publishable
4. Preencha o `.env`.

Nunca coloque `service_role` no aplicativo.

## Rodar localmente

```bash
npm install
npm run dev
```

## Teste desta etapa

1. Entre com `ramon@pa.com` e a senha que você criou no Supabase Auth.
2. Selecione um corredor.
3. Clique em **Iniciar batida**.
4. Clique em **+ Registrar produto**.
5. Cadastre um produto.
6. O produto deve aparecer imediatamente em **Produtos desta batida (1)** sem atualizar a página.
7. Clique em **Finalizar batida**.

## Ainda não incluído nesta etapa

- Cancelamento de batida com opção manter/descartar produtos.
- Promoções/ofertas.
- FEFO/PIQUE.
- Relatórios.
- Administração de usuários pela interface.
- Fotos/câmera/barcode.
- PWA instalável.

## Etapa de Promotores no Supabase
Antes de usar o módulo Promotores nesta versão, execute o arquivo `supabase/20260920_promotores.sql` no SQL Editor do projeto Supabase. Ele cria as tabelas, índices e políticas RLS necessárias.

## Realtime e Android
Execute `supabase/20260920_realtime.sql` no SQL Editor para ativar as tabelas de Realtime. O projeto inclui manifest PWA e service worker para instalação no Android pelo Chrome.
