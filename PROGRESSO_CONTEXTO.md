# Projeto Vencimento PA — Resumo de continuidade

## Objetivo atual
Prioridade definida por Ramon: deixar o aplicativo utilizável em celular Android e permitir trabalho da equipe em tempo real usando Supabase.

## Equipe e fluxo desejado
- Ramon: registra a batida, executa PIQUE e acompanha os produtos.
- Luan e Wagner: visualizam as atualizações e continuam a operação conforme suas permissões.
- Quando um produto for encaminhado para a área de vencimentos, os outros usuários devem receber a atualização.

## Base técnica
- React + TypeScript + Vite.
- Supabase Auth + banco PostgreSQL + Realtime.
- PWA inicial com manifest e service worker.
- Aplicativo acessível por Android e computador usando o mesmo endereço.

## Implementado nesta etapa
- Componente global `src/components/RealtimeNotifications.tsx`.
- Assinatura Supabase Realtime para `batches` e `batch_products`.
- Lista de atualizações recebidas de outros usuários.
- Indicador de conexão do Realtime.
- Solicitação de permissão para notificações do navegador quando suportada.
- Manifest PWA em `public/manifest.webmanifest`.
- Service worker em `public/sw.js`.
- Ícones PWA em `public/icons/`.
- SQL de ativação do Realtime em `supabase/20260920_realtime.sql`.
- Ajustes iniciais para uso em telas pequenas.

## Limitação importante
A notificação via API do navegador funciona enquanto a aplicação está aberta ou em segundo plano com o navegador mantendo a sessão. Notificações garantidas quando o aplicativo estiver completamente fechado exigem uma camada de push, como Web Push/FCM, a ser implementada em etapa posterior.

## Ainda pendente
1. Executar o SQL de Realtime no Supabase.
2. Instalar dependências e validar `npm run build`.
3. Testar dois usuários simultaneamente em celulares/computadores diferentes.
4. Criar o fluxo real de PIQUE e de entrada na área de vencimentos.
5. Registrar mudanças de status e eventos com autor, horário e produto.
6. Implementar push em segundo plano/fechado.
7. Empacotar APK Android depois da PWA estabilizada.

## Teste recomendado
- Abrir o app com dois usuários.
- No usuário A, iniciar uma batida e registrar um produto.
- No usuário B, verificar a atualização na área de equipe em tempo real.
- Executar o SQL antes do teste.
