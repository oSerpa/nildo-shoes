import { createClient } from '@supabase/supabase-js'
import { BUCKET_FOTOS } from '../config'

const url = import.meta.env.VITE_SUPABASE_URL
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !chave) {
  console.error('Faltam VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
}

export const supabase = createClient(url, chave)

export const urlFoto = (caminho) =>
  caminho ? supabase.storage.from(BUCKET_FOTOS).getPublicUrl(caminho).data.publicUrl : ''

// Produto como a interface usa: nomes de marca/categoria achatados e preço final
export function normalizar(p) {
  return {
    ...p,
    marca: p.marca?.nome ?? '',
    categoria: p.categoria?.nome ?? '',
    preco: Number(p.preco),
    preco_promocional: p.preco_promocional == null ? null : Number(p.preco_promocional),
    tamanhos: [...(p.tamanhos ?? [])].sort((a, b) => a - b),
    fotosUrl: (p.fotos ?? []).map(urlFoto),
  }
}

export const SELECT_PRODUTO = '*, marca:marcas(id, nome), categoria:categorias(id, nome)'
