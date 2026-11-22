import { LOJA } from '../config'

export const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
export const precoFinal = (p) => p.preco_promocional ?? p.preco
export const desconto = (p) => Math.round((1 - p.preco_promocional / p.preco) * 100)
export const parcela = (v) => (LOJA.parcelas > 1 ? `ou ${LOJA.parcelas}x de ${brl(v / LOJA.parcelas)} sem juros` : '')
export const faixaNumeracao = (t) => (t.length ? `Do ${t[0]} ao ${t[t.length - 1]}` : '')

export function linkWhatsApp(p, numero) {
  const preco = `${brl(precoFinal(p))}${p.preco_promocional ? ' (promoção)' : ''}`
  const texto = numero
    ? `Olá, ${LOJA.nome}! Tenho interesse neste modelo: ${p.nome} (${p.marca}), número ${numero}, ${preco}. Ainda tem disponível?`
    : `Olá, ${LOJA.nome}! Tenho interesse neste modelo: ${p.nome} (${p.marca}), ${preco}. Quais numerações vocês têm?`
  return `https://wa.me/${LOJA.whatsapp}?text=${encodeURIComponent(texto)}`
}

export const linkWhatsAppLoja = () => `https://wa.me/${LOJA.whatsapp}`
