import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

type Promotor = { id: string; nome: string; empresa: string; ativo: boolean; created_by: string }
type Produto = { id: string; promotor_id: string; produto: string; empresa: string; validade: string | null; ean: string | null; created_at: string }

type Props = { userId: string }

export function Promotores({ userId }: Props) {
  const [promotores, setPromotores] = useState<Promotor[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [nome, setNome] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState('')
  const [produto, setProduto] = useState('')
  const [validade, setValidade] = useState('')
  const [ean, setEan] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { void loadData() }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    const [{ data: promotorRows, error: promotorError }, { data: productRows, error: productError }] = await Promise.all([
      supabase.from('promotores').select('id,nome,empresa,ativo,created_by').order('nome'),
      supabase.from('promotor_products').select('id,promotor_id,produto,empresa,validade,ean,created_at').order('created_at', { ascending: false }),
    ])
    if (promotorError || productError) {
      setError(promotorError?.message ?? productError?.message ?? 'Não foi possível carregar os promotores.')
    } else {
      setPromotores((promotorRows ?? []) as Promotor[])
      setProdutos((productRows ?? []) as Produto[])
    }
    setLoading(false)
  }

  async function addPromotor() {
    if (!nome.trim() || !empresa.trim()) return
    setSaving(true); setError(''); setNotice('')
    const { data, error: insertError } = await supabase.from('promotores').insert({ nome: nome.trim(), empresa: empresa.trim(), created_by: userId }).select('id,nome,empresa,ativo,created_by').single()
    if (insertError) setError(insertError.message)
    else if (data) { setPromotores(current => [...current, data as Promotor].sort((a, b) => a.nome.localeCompare(b.nome))); setNome(''); setEmpresa(''); setShowForm(false); setNotice('Promotor cadastrado com sucesso.') }
    setSaving(false)
  }

  async function togglePromotor(promotor: Promotor) {
    setError(''); setNotice('')
    const { data, error: updateError } = await supabase.from('promotores').update({ ativo: !promotor.ativo }).eq('id', promotor.id).select('id,nome,empresa,ativo,created_by').single()
    if (updateError) setError(updateError.message)
    else if (data) { setPromotores(current => current.map(item => item.id === promotor.id ? data as Promotor : item)); setNotice('Status do promotor atualizado.') }
  }

  async function addProduto() {
    const p = promotores.find(item => item.id === selected)
    if (!p || !produto.trim()) return
    setSaving(true); setError(''); setNotice('')
    const { data, error: insertError } = await supabase.from('promotor_products').insert({ promotor_id: p.id, produto: produto.trim(), empresa: p.empresa, validade: validade || null, ean: ean.trim() || null, created_by: userId }).select('id,promotor_id,produto,empresa,validade,ean,created_at').single()
    if (insertError) setError(insertError.message)
    else if (data) { setProdutos(current => [data as Produto, ...current]); setProduto(''); setValidade(''); setEan(''); setNotice('Produto do promotor registrado com sucesso.') }
    setSaving(false)
  }

  const filtered = useMemo(() => produtos.filter(item => !selected || item.promotor_id === selected), [produtos, selected])

  return <section className="module-stack">
    <div className="card module-toolbar"><div><span className="eyebrow">Módulo separado da prevenção</span><h2>Promotores</h2><p>Os cadastros agora ficam compartilhados no Supabase para a equipe consultar os mesmos dados.</p></div><button onClick={() => setShowForm(!showForm)}>+ Novo promotor</button></div>
    {error && <div className="info-box">{error}</div>}
    {notice && <div className="success-box">{notice}</div>}
    {showForm && <div className="card form-card"><h3>Cadastrar promotor</h3><div className="form-grid"><label>Nome<input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex.: Felipe" /></label><label>Empresa / marca<input value={empresa} onChange={e => setEmpresa(e.target.value)} placeholder="Ex.: Coca-Cola" /></label></div><div className="actions"><button className="secondary" onClick={() => setShowForm(false)}>Cancelar</button><button disabled={saving || !nome.trim() || !empresa.trim()} onClick={() => void addPromotor()}>{saving ? 'Salvando...' : 'Salvar promotor'}</button></div></div>}
    <div className="card"><div className="section-title"><h2>Promotores cadastrados</h2><span>{promotores.length}</span></div>{loading ? <div className="empty-state">Carregando promotores...</div> : <div className="promotor-grid">{promotores.map(p => <article className="promotor-card" key={p.id}><div className="promotor-avatar">🏪</div><div><strong>{p.nome}</strong><span>{p.empresa}</span><small>{p.ativo ? 'Ativo' : 'Inativo'}</small></div><button className="secondary" onClick={() => void togglePromotor(p)}>{p.ativo ? 'Desativar' : 'Ativar'}</button></article>)}{!promotores.length && <div className="empty-state">Nenhum promotor cadastrado ainda.</div>}</div>}</div>
    <div className="card"><div className="section-title"><h2>Registrar produto do promotor</h2></div><div className="form-grid"><label>Promotor<select value={selected} onChange={e => setSelected(e.target.value)}><option value="">Selecione...</option>{promotores.filter(p => p.ativo).map(p => <option key={p.id} value={p.id}>{p.nome} • {p.empresa}</option>)}</select></label><label>Produto<input value={produto} onChange={e => setProduto(e.target.value)} placeholder="Nome do produto" /></label><label>Validade<input type="date" value={validade} onChange={e => setValidade(e.target.value)} /></label><label>EAN<input value={ean} onChange={e => setEan(e.target.value)} placeholder="Código de barras" /></label></div><button disabled={saving || !selected || !produto.trim()} onClick={() => void addProduto()}>{saving ? 'Salvando...' : 'Registrar produto'}</button></div>
    <div className="card"><div className="section-title"><h2>Atividade dos promotores</h2><span>{filtered.length} registro(s)</span></div>{filtered.length ? <div className="tracking-list">{filtered.map(p => <article className="tracking-row" key={p.id}><div><strong>{p.produto}</strong><span>{promotores.find(x => x.id === p.promotor_id)?.nome ?? 'Promotor'} • {p.empresa}</span></div><div><small>Validade</small><strong>{p.validade || 'Não informada'}</strong></div><div><small>EAN</small><strong>{p.ean || '—'}</strong></div><div><small>Registro</small><strong>{new Date(p.created_at).toLocaleDateString('pt-BR')}</strong></div></article>)}</div> : <div className="empty-state">Nenhuma atividade encontrada.</div>}</div>
  </section>
}
