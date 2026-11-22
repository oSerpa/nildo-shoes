import { brl, parcela, precoFinal } from './format'
import { LOJA } from '../config'

export const linkProduto = (p) => `${window.location.origin}/p/${p.id}`

// Texto pronto pra legenda de Instagram, Facebook, status e grupos
export function textoAnuncio(p) {
  const linhas = [`${p.nome} (${p.marca})`, '']
  if (p.preco_promocional != null) linhas.push(`De ${brl(p.preco)} por ${brl(p.preco_promocional)}`)
  else linhas.push(brl(p.preco))
  const parc = parcela(precoFinal(p))
  if (parc) linhas.push(parc)
  if (p.tamanhos?.length) linhas.push(`Numeração: ${p.tamanhos.join(', ')}`)
  if (p.descricao) linhas.push('', p.descricao)
  linhas.push('', `Veja as fotos e peça pelo WhatsApp: ${linkProduto(p)}`, `${LOJA.nome} · WhatsApp ${LOJA.whatsappExibicao}`)
  return linhas.join('\n')
}

// Baixa a capa e converte pra JPEG, que todo app aceita (WEBP às vezes é recusado)
export async function fotoCapaJpeg(p) {
  const url = p.fotosUrl?.[0]
  if (!url) return null
  const r = await fetch(url)
  if (!r.ok) throw new Error('foto')
  const bitmap = await createImageBitmap(await r.blob())
  const c = document.createElement('canvas')
  c.width = bitmap.width; c.height = bitmap.height
  const ctx = c.getContext('2d')
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
  ctx.drawImage(bitmap, 0, 0)
  const blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.92))
  const nome = p.nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase()
  return new File([blob], `${nome || 'produto'}.jpg`, { type: 'image/jpeg' })
}
