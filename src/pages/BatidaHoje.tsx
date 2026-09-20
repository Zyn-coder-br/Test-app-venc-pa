import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Batch, BatchProduct, Corridor } from '../types/database'
import { NewBatchProductModal } from '../components/NewBatchProductModal'

type Props = {
  userId: string
  onLogout: () => void
}

export function BatidaHoje({ userId, onLogout }: Props) {
  const [corridors, setCorridors] = useState<Corridor[]>([])
  const [selectedCorridorId, setSelectedCorridorId] = useState('')
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null)
  const [products, setProducts] = useState<BatchProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProduct, setShowNewProduct] = useState(false)
  const [message, setMessage] = useState('')

  const activeCorridor = useMemo(
    () => corridors.find((item) => item.id === activeBatch?.corridor_id),
    [corridors, activeBatch],
  )

  useEffect(() => {
    void loadInitialData()
  }, [])

  useEffect(() => {
    if (!activeBatch) return

    const channel = supabase
      .channel(`batch-products-${activeBatch.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'batch_products',
          filter: `batch_id=eq.${activeBatch.id}`,
        },
        () => void loadProducts(activeBatch.id),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [activeBatch?.id])

  async function loadInitialData() {
    setLoading(true)

    const [{ data: corridorData }, { data: batchData }] = await Promise.all([
      supabase.from('corridors').select('*').eq('ativo', true).order('numero'),
      supabase
        .from('batches')
        .select('*')
        .eq('responsavel_id', userId)
        .eq('status', 'em_andamento')
        .order('inicio_em', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

    setCorridors((corridorData ?? []) as Corridor[])

    if (batchData) {
      setActiveBatch(batchData as Batch)
      await loadProducts(batchData.id)
    }

    setLoading(false)
  }

  async function loadProducts(batchId: string) {
    const { data } = await supabase
      .from('batch_products')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true })

    setProducts((data ?? []) as BatchProduct[])
  }

  async function startBatch() {
    if (!selectedCorridorId) {
      setMessage('Selecione um corredor.')
      return
    }

    setMessage('')
    const { data, error } = await supabase
      .from('batches')
      .insert({ corridor_id: selectedCorridorId, responsavel_id: userId, status: 'em_andamento' })
      .select('*')
      .single()

    if (error || !data) {
      setMessage(error?.message ?? 'Não foi possível iniciar a batida.')
      return
    }

    setActiveBatch(data as Batch)
    setProducts([])
  }

  async function finishBatch() {
    if (!activeBatch) return

    const { error } = await supabase
      .from('batches')
      .update({ status: 'finalizada', finalizada_em: new Date().toISOString() })
      .eq('id', activeBatch.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setActiveBatch(null)
    setProducts([])
    setSelectedCorridorId('')
    setMessage('Batida finalizada com sucesso.')
  }

  function handleSavedProduct(product: BatchProduct) {
    // Este é o ponto que evita o bug antigo:
    // o produto entra no estado local imediatamente.
    setProducts((current) => [...current, product])
  }

  if (loading) {
    return <main className="center-page"><div className="card">Carregando...</div></main>
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <strong>Projeto Vencimento PA</strong>
          <span>Batida de hoje</span>
        </div>
        <button className="secondary" onClick={onLogout}>Sair</button>
      </header>

      {!activeBatch ? (
        <section className="card">
          <h1>Batida de hoje</h1>
          <p>Escolha o corredor que será verificado.</p>

          <label>Corredor</label>
          <select value={selectedCorridorId} onChange={(e) => setSelectedCorridorId(e.target.value)}>
            <option value="">Selecione...</option>
            {corridors.map((corridor) => (
              <option key={corridor.id} value={corridor.id}>
                Corredor {corridor.numero}{corridor.categoria ? ` — ${corridor.categoria}` : ''}
              </option>
            ))}
          </select>

          {message && <div className="info-box">{message}</div>}
          <button onClick={startBatch}>Iniciar batida</button>
        </section>
      ) : (
        <>
          <section className="card batch-header">
            <div>
              <span className="eyebrow">Batida em andamento</span>
              <h1>Corredor {activeCorridor?.numero ?? '—'}</h1>
              <p>{activeCorridor?.categoria || 'Categoria ainda não definida'}</p>
            </div>
            <button onClick={() => setShowNewProduct(true)}>+ Registrar produto</button>
          </section>

          <section className="card">
            <div className="section-title">
              <h2>Produtos desta batida ({products.length})</h2>
            </div>

            {products.length === 0 ? (
              <div className="empty-state">Nenhum produto registrado nesta batida.</div>
            ) : (
              <div className="product-list">
                {products.map((product) => (
                  <article className="product-item" key={product.id}>
                    <div>
                      <strong>{product.nome}</strong>
                      <span>EAN: {product.ean || 'não informado'}</span>
                    </div>
                    <div className="product-meta">
                      <span>Validade: {product.data_validade}</span>
                      <span>Qtd.: {product.quantidade_encontrada}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {message && <div className="info-box">{message}</div>}
            <button className="success" onClick={finishBatch}>Finalizar batida</button>
          </section>
        </>
      )}

      {showNewProduct && activeBatch && (
        <NewBatchProductModal
          batchId={activeBatch.id}
          userId={userId}
          onClose={() => setShowNewProduct(false)}
          onSaved={handleSavedProduct}
        />
      )}
    </main>
  )
}
