import { useCallback, useEffect, useRef, useState } from 'react'
import Etiqueta from './Etiqueta'
import { desconto } from '../lib/format'

// Faixa de promoções: a linha de tempo enche em 5 s e passa pra próxima
export default function Promocoes({ produtos, onAbrir, pausado }) {
  const strip = useRef(null)
  const [ciclo, setCiclo] = useState(0)        // muda a key da linha pra reiniciar a animação
  const [hover, setHover] = useState(false)

  const ir = useCallback((dir) => {
    const s = strip.current
    if (!s?.firstElementChild) return
    const passo = s.firstElementChild.offsetWidth + 16
    const fim = s.scrollLeft + s.clientWidth >= s.scrollWidth - 4
    if (dir > 0 && fim) s.scrollLeft = 0
    else if (dir < 0 && s.scrollLeft <= 4) s.scrollLeft = s.scrollWidth
    else s.scrollBy({ left: dir * passo })
    setCiclo((c) => c + 1)
  }, [])

  useEffect(() => setCiclo((c) => c + 1), [produtos.length])
  if (!produtos.length) return null

  return (
    <section className={`promo${hover || pausado ? ' pausado' : ''}`} aria-labelledby="promo-t"
      onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div className="wrap">
        <div className="promo-head">
          <div><h2 id="promo-t">Em promoção</h2><p>Preço baixado enquanto durar o estoque</p></div>
          {produtos.length > 1 && (
            <div className="arrows">
              <button type="button" aria-label="Promoção anterior" onClick={() => ir(-1)}>&#8249;</button>
              <button type="button" aria-label="Próxima promoção" onClick={() => ir(1)}>&#8250;</button>
            </div>
          )}
        </div>
        <div className="strip" ref={strip} onTouchEnd={() => setCiclo((c) => c + 1)}>
          {produtos.map((p) => (
            <button key={p.id} type="button" className="pcard" onClick={() => onAbrir(p)}>
              <span className="ph"><img src={p.fotosUrl[0]} alt="" /><span className="off">-{desconto(p)}%</span></span>
              <div className="info">
                <div className="marca">{p.marca}</div>
                <div className="nome">{p.nome}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 4 }}><Etiqueta p={p} /></div>
                <div className="ver">Ver detalhes</div>
              </div>
            </button>
          ))}
        </div>
        {produtos.length > 1 && (
          <div className="timer" aria-hidden="true">
            <i key={ciclo} onAnimationEnd={() => ir(1)} />
          </div>
        )}
      </div>
    </section>
  )
}
