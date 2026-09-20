export type Corridor = {
  id: string
  numero: number
  nome: string | null
  categoria: string | null
  ativo: boolean
}

export type Batch = {
  id: string
  corridor_id: string
  responsavel_id: string
  status: 'em_andamento' | 'finalizada' | 'cancelada' | 'pendente'
  inicio_em: string
  finalizada_em: string | null
  observacoes: string | null
}

export type BatchProduct = {
  id: string
  batch_id: string
  product_id: string | null
  nome: string
  ean: string | null
  lote: string | null
  data_validade: string
  quantidade_encontrada: number
  quantidade_separada: number
  status:
    | 'encontrado'
    | 'ainda_no_corredor'
    | 'separado'
    | 'aguardando_oferta'
    | 'oferta_solicitada'
    | 'oferta_aplicada'
    | 'resolvido'
  foto_url: string | null
  created_by: string
  created_at: string
}
