import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = { userId: string }
type Activity = { id: string; message: string; createdAt: string; kind: 'batida' | 'produto' | 'sistema' }

function notifyBrowser(message: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'granted') new Notification('Vencimento PA', { body: message, icon: '/icons/icon-192.svg' })
}

export function RealtimeNotifications({ userId }: Props) {
  const [connected, setConnected] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied',
  )
  const [activities, setActivities] = useState<Activity[]>([])

  const permissionLabel = useMemo(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'Não disponível neste navegador'
    if (permission === 'granted') return 'Notificações ativadas'
    if (permission === 'denied') return 'Notificações bloqueadas'
    return 'Ativar notificações'
  }, [permission])

  useEffect(() => {
    const channel = supabase
      .channel(`pa-global-realtime-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, (payload) => {
        const record = (payload.new ?? {}) as Record<string, unknown>
        if (record.responsavel_id === userId) return
        const status = record.status === 'finalizada' ? 'finalizou uma batida' : payload.eventType === 'INSERT' ? 'iniciou uma batida' : 'atualizou uma batida'
        const activity: Activity = { id: `batch-${Date.now()}-${Math.random()}`, message: `Outro usuário ${status}.`, createdAt: new Date().toISOString(), kind: 'batida' }
        setActivities((current) => [activity, ...current].slice(0, 8))
        notifyBrowser(activity.message)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batch_products' }, (payload) => {
        const record = (payload.new ?? {}) as Record<string, unknown>
        if (record.created_by === userId) return
        const status = payload.eventType === 'INSERT' ? 'registrou um produto em uma batida' : 'atualizou um produto da operação'
        const activity: Activity = { id: `product-${Date.now()}-${Math.random()}`, message: `Outro usuário ${status}.`, createdAt: new Date().toISOString(), kind: 'produto' }
        setActivities((current) => [activity, ...current].slice(0, 8))
        notifyBrowser(activity.message)
      })
      .subscribe((status) => setConnected(status === 'SUBSCRIBED'))

    return () => { void supabase.removeChannel(channel) }
  }, [userId])

  async function enableNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }

  return (
    <section className="realtime-panel" aria-live="polite">
      <div className="realtime-heading">
        <div>
          <span className="eyebrow">Equipe em tempo real</span>
          <h3><span className={`realtime-dot ${connected ? 'connected' : ''}`} />{connected ? 'Conectado ao Supabase' : 'Conectando ao Supabase...'}</h3>
          <p>Atualizações de batidas e produtos de outros usuários aparecem aqui.</p>
        </div>
        <button className="secondary small" onClick={enableNotifications} disabled={permission === 'granted' || permission === 'denied'}>{permissionLabel}</button>
      </div>
      {activities.length === 0 ? (
        <div className="realtime-empty">Nenhuma atualização de outro usuário recebida ainda.</div>
      ) : (
        <div className="realtime-list">
          {activities.map((activity) => <div className="realtime-item" key={activity.id}><span className="realtime-type">{activity.kind === 'batida' ? 'BATIDA' : 'PRODUTO'}</span><span>{activity.message}</span><small>{new Date(activity.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>)}
        </div>
      )}
    </section>
  )
}
