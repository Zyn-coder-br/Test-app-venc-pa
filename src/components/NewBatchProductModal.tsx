import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { BatchProduct } from '../types/database'

type Props = {
  batchId: string
  userId: string
  onClose: () => void
  onSaved: (product: BatchProduct) => void
}

export function NewBatchProductModal({ batchId, userId, onClose, onSaved }: Props) {
  const [nome, setNome] = useState('')
  const [ean, setEan] = useState('')
  const [validade, setValidade] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const { data, error } = await supabase
      .from('batch_products')
      .insert({
        batch_id: batchId,
        nome: nome.trim(),
        ean: ean.trim() || null,
        data_validade: validade,
        quantidade_encontrada: quantidade,
        quantidade_separada: 0,
        status: 'encontrado',
        created_by: userId,
      })
      .select('*')
      .single()

    setSaving(false)

    if (error || !data) {
      setError(error?.message ?? 'Não foi possível salvar o produto.')
      return
    }

    // Atualiza a tela imediatamente, sem precisar recarregar a página.
    onSaved(data as BatchProduct)
    onClose()
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <form className="card modal" onSubmit={save}>
        <div className="modal-header">
          <h2>Novo produto da batida</h2>
          <button className="secondary small" type="button" onClick={onClose}>Cancelar</button>
        </div>

        <label>Produto</label>
        <input value={nome} onChange={(e) => setNome(e.target.value)} required autoFocus />

        <label>EAN</label>
        <input value={ean} onChange={(e) => setEan(e.target.value)} inputMode="numeric" />

        <label>Data de validade</label>
        <input value={validade} onChange={(e) => setValidade(e.target.value)} type="date" required />

        <label>Quantidade encontrada</label>
        <input
          value={quantidade}
          onChange={(e) => setQuantidade(Number(e.target.value))}
          type="number"
          min="0"
          required
        />

        {error && <div className="error-box">{error}</div>}

        <button disabled={saving} type="submit">
          {saving ? 'Salvando...' : 'Salvar produto'}
        </button>
      </form>
    </div>
  )
}
