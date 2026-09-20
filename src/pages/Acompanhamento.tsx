import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Batch, Corridor } from '../types/database'

type Row = Corridor & { ultimaBatida: string | null; diasSemBatida: number | null; batidasMes: number }

function daysBetween(date: string | null) {
  if (!date) return null
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000))
}

export function Acompanhamento() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'todos' | 'atencao' | 'ok'>('todos')

  useEffect(() => { void load() }, [])

  async function load() {
    setLoading(true); setError('')
    const [{ data: corridors, error: corridorError }, { data: batches, error: batchError }] = await Promise.all([
      supabase.from('corridors').select('*').eq('ativo', true).order('numero'),
      supabase.from('batches').select('*').eq('status', 'finalizada').order('finalizada_em', { ascending: false }),
    ])
    if (corridorError || batchError) { setError(corridorError?.message ?? batchError?.message ?? 'Não foi possível carregar o acompanhamento.'); setLoading(false); return }
    const list = (corridors ?? []) as Corridor[]
    const finished = (batches ?? []) as Batch[]
    const startMonth = new Date(); startMonth.setDate(1); startMonth.setHours(0, 0, 0, 0)
    setRows(list.map(c => {
      const related = finished.filter(b => b.corridor_id === c.id)
      const latest = related[0]?.finalizada_em ?? related[0]?.inicio_em ?? null
      return { ...c, ultimaBatida: latest, diasSemBatida: daysBetween(latest), batidasMes: related.filter(b => new Date(b.finalizada_em ?? b.inicio_em) >= startMonth).length }
    }))
    setLoading(false)
  }

  const covered = useMemo(() => rows.filter(r => r.batidasMes > 0).length, [rows])
  const overdue = useMemo(() => rows.filter(r => r.diasSemBatida === null || r.diasSemBatida > 15).length, [rows])
  const percent = rows.length ? Math.round(covered / rows.length * 100) : 0
  const visible = rows.filter(r => filter === 'todos' || (filter === 'atencao' ? r.diasSemBatida === null || (r.diasSemBatida ?? 0) > 15 : (r.diasSemBatida ?? 999) <= 15))

  return <section className="module-stack">
    <div className="card module-toolbar"><div><span className="eyebrow">Ciclo de conferência</span><h2>Progresso dos corredores</h2><p>Acompanhe os 22 corredores e priorize quem está há mais tempo sem batida.</p></div><button onClick={() => void load()}>Atualizar</button></div>
    <div className="tracking-kpis"><div className="tracking-kpi"><small>Cobertura no mês</small><strong>{covered}/{rows.length}</strong><span>{percent}% dos corredores</span></div><div className="tracking-kpi"><small>Acima de 15 dias</small><strong className={overdue ? 'danger-text' : ''}>{overdue}</strong><span>Precisam de atenção</span></div><div className="tracking-kpi"><small>Meta do ciclo</small><strong>15 dias</strong><span>Máximo recomendado</span></div></div>
    <div className="card"><div className="section-title"><h2>Mapa de batidas</h2><select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}><option value="todos">Todos</option><option value="atencao">Atenção</option><option value="ok">Em dia</option></select></div>{error && <div className="info-box">{error}</div>}{loading ? <div className="empty-state">Carregando corredores...</div> : <div className="tracking-list">{visible.map(r => <article className="tracking-row" key={r.id}><div><strong>Corredor {r.numero}</strong><span>{r.categoria || r.nome || 'Categoria não definida'}</span></div><div><small>Última batida</small><strong>{r.ultimaBatida ? new Date(r.ultimaBatida).toLocaleDateString('pt-BR') : 'Nunca realizada'}</strong></div><div><small>Dias sem batida</small><strong className={r.diasSemBatida === null || r.diasSemBatida > 15 ? 'danger-text' : ''}>{r.diasSemBatida ?? '—'}</strong></div><span className={`status-pill ${r.diasSemBatida === null || r.diasSemBatida > 15 ? 'attention' : 'good'}`}>{r.diasSemBatida === null || r.diasSemBatida > 15 ? 'Atenção' : 'Em dia'}</span></article>)}</div>}</div>
  </section>
}
