import { useEffect, useRef, useState } from 'react'

export const FAIXAS = [
  ['0-150', 'Até R$ 150'],
  ['150-250', 'R$ 150 a R$ 250'],
  ['250-99999', 'Acima de R$ 250'],
]

// Abas de categoria + menus de numeração, marca e preço
export default function Filtros({ produtos, filtro, setFiltro, total }) {
  const [aberto, setAberto] = useState(null)
  const caixa = useRef(null)

  const categorias = ['Todas', ...new Set(produtos.map((p) => p.categoria).filter(Boolean))]
  const grupos = [
    { k: 'tam', nome: 'Numeração', tipo: 'num', rot: (v) => `Nº ${v}`,
      ops: [...new Set(produtos.flatMap((p) => p.tamanhos))].sort((a, b) => a - b).map((t) => [String(t), t]) },
    { k: 'marca', nome: 'Marca', tipo: 'lista', rot: (v) => v,
      ops: [...new Set(produtos.map((p) => p.marca).filter(Boolean))].sort().map((m) => [m, m]),
      conta: (v) => produtos.filter((p) => p.marca === v).length },
    { k: 'preco', nome: 'Preço', tipo: 'lista', rot: (v) => FAIXAS.find((f) => f[0] === v)?.[1], ops: FAIXAS },
  ]

  useEffect(() => {
    if (!aberto) return
    const fora = (e) => { if (!caixa.current?.contains(e.target)) setAberto(null) }
    const esc = (e) => e.key === 'Escape' && setAberto(null)
    document.addEventListener('click', fora)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('click', fora); document.removeEventListener('keydown', esc) }
  }, [aberto])

  const set = (k, v) => setFiltro((f) => ({ ...f, [k]: v }))

  return (
    <div className="filterbar">
      <div className="wrap fb">
        <nav className="tabs" aria-label="Categorias">
          {categorias.map((c) => (
            <button key={c} className="tab" type="button" aria-pressed={filtro.cat === c}
              onClick={(e) => { set('cat', c); e.currentTarget.scrollIntoView({ inline: 'nearest', block: 'nearest' }) }}>
              {c}
            </button>
          ))}
        </nav>
        <div className="triggers" ref={caixa}>
          {grupos.map((g) => {
            const v = filtro[g.k]
            const open = aberto === g.k
            return (
              <div className="fwrap" key={g.k}>
                <button className={`trg${v ? ' ativo' : ''}`} type="button" aria-expanded={open} aria-haspopup="true"
                  onClick={() => setAberto(open ? null : g.k)}>
                  {v ? g.rot(v) : g.nome}
                </button>
                {open && (
                  <div className="pop" role="dialog" aria-label={g.nome}>
                    <h4>{g.nome}</h4>
                    <div className={`opts${g.tipo === 'lista' ? ' lista' : ''}`}>
                      {g.ops.map(([val, txt]) => (
                        <button key={val} type="button" className={`opt${g.tipo === 'num' ? ' num' : ''}`}
                          aria-pressed={v === val} onClick={() => set(g.k, v === val ? '' : val)}>
                          {txt}{g.conta && <small>{g.conta(val)}</small>}
                        </button>
                      ))}
                    </div>
                    <div className="pop-foot">
                      <button className="lnk" type="button" onClick={() => set(g.k, '')}>Limpar</button>
                      <button className="ok" type="button" onClick={() => setAberto(null)}>
                        {total ? `Ver ${total} ${total === 1 ? 'modelo' : 'modelos'}` : 'Nenhum modelo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function FiltrosAplicados({ filtro, setFiltro }) {
  const rot = { tam: (v) => `Nº ${v}`, marca: (v) => v, preco: (v) => FAIXAS.find((f) => f[0] === v)?.[1] }
  const ativos = ['tam', 'marca', 'preco'].filter((k) => filtro[k])
  if (!ativos.length) return null
  return (
    <div className="aplicados">
      {ativos.map((k) => (
        <button key={k} type="button" className="pill" aria-label={`Tirar filtro ${rot[k](filtro[k])}`}
          onClick={() => setFiltro((f) => ({ ...f, [k]: '' }))}>
          {rot[k](filtro[k])}<i>&#10005;</i>
        </button>
      ))}
      {ativos.length > 1 && (
        <button type="button" className="lnk" onClick={() => setFiltro((f) => ({ ...f, tam: '', marca: '', preco: '' }))}>
          Limpar tudo
        </button>
      )}
    </div>
  )
}
