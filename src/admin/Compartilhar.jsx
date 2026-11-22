import { useEffect, useMemo, useState } from 'react'
import { fotoCapaJpeg, linkProduto, textoAnuncio } from '../lib/anuncio'

async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true } catch { return false }
}

// Painel "Compartilhar": texto editável + capa, prontos pra postar em outros lugares
export default function Compartilhar({ p, onFechar, avisar }) {
  const [texto, setTexto] = useState(() => textoAnuncio(p))
  const [foto, setFoto] = useState(null)
  const [erroFoto, setErroFoto] = useState(false)

  useEffect(() => {
    let vivo = true
    fotoCapaJpeg(p).then((f) => vivo && setFoto(f)).catch(() => vivo && setErroFoto(true))
    const esc = (e) => e.key === 'Escape' && onFechar()
    document.addEventListener('keydown', esc)
    return () => { vivo = false; document.removeEventListener('keydown', esc) }
  }, [p, onFechar])

  const fotoUrl = useMemo(() => (foto ? URL.createObjectURL(foto) : ''), [foto])
  useEffect(() => () => fotoUrl && URL.revokeObjectURL(fotoUrl), [fotoUrl])

  const podeCompartilhar = !!foto && typeof navigator.canShare === 'function' && navigator.canShare({ files: [foto] })

  async function compartilhar() {
    // Instagram e alguns apps ignoram o texto que vem junto com a foto, então ele vai pra área de transferência também
    const copiou = await copiar(texto)
    try {
      await navigator.share({ files: [foto], text: texto, title: p.nome })
      if (copiou) avisar('Texto copiado. Se o app não colocar a legenda sozinho, é só colar.')
    } catch (e) {
      if (e?.name !== 'AbortError') avisar('Não foi possível abrir o compartilhamento. Use Copiar texto e Baixar foto.')
    }
  }

  function baixar() {
    const a = Object.assign(document.createElement('a'), { href: fotoUrl, download: foto.name })
    document.body.append(a); a.click(); a.remove()
  }

  return (
    <>
      <div className="fundo" onClick={onFechar} />
      <div className="gaveta" role="dialog" aria-modal="true" aria-label="Compartilhar anúncio">
        <div className="g-topo"><h3>Compartilhar</h3><button className="ico" type="button" aria-label="Fechar" onClick={onFechar}>&#10005;</button></div>
        <div className="g-corpo">
          {!p.ativo && <p className="erro">Este anúncio está pausado, então o link não vai abrir no site. Coloque no ar antes de divulgar.</p>}
          <div className="comp-foto">
            {foto ? <img src={fotoUrl} alt={`Capa de ${p.nome}`} />
              : <span>{erroFoto ? 'Não foi possível carregar a foto.' : 'Preparando a foto...'}</span>}
          </div>
          <label htmlFor="c-texto">Texto do anúncio <span className="dica">Pode editar antes de copiar.</span>
            <textarea id="c-texto" value={texto} onChange={(e) => setTexto(e.target.value)} rows={11} />
          </label>
          <div className="comp-link"><span>{linkProduto(p)}</span>
            <button className="lnk" type="button" onClick={async () => avisar((await copiar(linkProduto(p))) ? 'Link copiado' : 'Não foi possível copiar')}>Copiar link</button>
          </div>
        </div>
        <div className="g-pe comp-acoes">
          <button className="btn sec" type="button" onClick={async () => avisar((await copiar(texto)) ? 'Texto copiado' : 'Não foi possível copiar')}>Copiar texto</button>
          <button className="btn sec" type="button" disabled={!foto} onClick={baixar}>Baixar foto</button>
          {podeCompartilhar && <button className="btn" type="button" onClick={compartilhar}>Compartilhar</button>}
        </div>
      </div>
    </>
  )
}
