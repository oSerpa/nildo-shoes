import { useEffect, useRef, useState } from 'react'
import Carrossel from './Carrossel'
import Etiqueta from './Etiqueta'
import { ZapIcone } from './ProdutoCard'
import { desconto, linkWhatsApp, parcela, precoFinal } from '../lib/format'

export default function ProdutoDetalhe({ p, onFechar }) {
  const [num, setNum] = useState(null)
  const fechar = useRef(null)

  useEffect(() => {
    const anterior = document.activeElement
    fechar.current?.focus()
    const esc = (e) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
      anterior?.focus?.()
    }
  }, [onFechar])

  return (
    <div className="backdrop" onClick={(e) => e.target === e.currentTarget && onFechar()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={p.nome}>
        <Carrossel fotos={p.fotosUrl} alt={p.nome}>
          {p.preco_promocional != null && <span className="off">-{desconto(p)}%</span>}
        </Carrossel>
        <div className="detail">
          <div className="head">
            <div>
              <div className="marca">{p.marca} · {p.categoria}</div>
              <h2>{p.nome}</h2>
            </div>
            <button ref={fechar} className="close" type="button" aria-label="Fechar" onClick={onFechar}>&#10005;</button>
          </div>
          <div className="pr">
            <div className="preco" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Etiqueta p={p} /></div>
            {parcela(precoFinal(p)) && <small>{parcela(precoFinal(p))}</small>}
          </div>
          {p.descricao && <p className="desc">{p.descricao}</p>}
          <div>
            <div className="lbl">Escolha a numeração</div>
            <div className="sizes">
              {p.tamanhos.map((t) => (
                <button key={t} className="size" type="button" aria-pressed={num === t} onClick={() => setNum(t)}>{t}</button>
              ))}
            </div>
          </div>
          <a className="zap" target="_blank" rel="noopener noreferrer"
             href={num ? linkWhatsApp(p, num) : undefined} aria-disabled={!num}>
            <ZapIcone />Pedir pelo WhatsApp
          </a>
          <div className="note">
            {num ? `Abre o WhatsApp com o pedido do número ${num} já escrito.` : 'Escolha a numeração pra liberar o pedido.'}
          </div>
        </div>
      </div>
    </div>
  )
}
