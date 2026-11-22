import Carrossel from './Carrossel'
import Etiqueta from './Etiqueta'
import { brl, desconto, faixaNumeracao, linkWhatsApp, precoFinal } from '../lib/format'

const ZapIcone = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3Z" /></svg>
)
export { ZapIcone }

export default function ProdutoCard({ p, onAbrir }) {
  const parar = (e) => e.stopPropagation()
  return (
    <article
      className="card"
      tabIndex={0}
      aria-label={`${p.nome}, ${brl(precoFinal(p))}. Abrir detalhes`}
      onClick={() => onAbrir(p)}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onAbrir(p) } }}
    >
      <Carrossel fotos={p.fotosUrl} alt={p.nome}>
        {p.preco_promocional != null && <span className="off">-{desconto(p)}%</span>}
      </Carrossel>
      <div className="card-body">
        <div className="marca">{p.marca}</div>
        <h3 className="nome">{p.nome}</h3>
        <div className="preco"><Etiqueta p={p} /></div>
        <div className="tams">{faixaNumeracao(p.tamanhos)}</div>
        <a className="card-zap" href={linkWhatsApp(p)} target="_blank" rel="noopener noreferrer"
           onClick={parar} onKeyDown={parar} aria-label={`Enviar mensagem sobre ${p.nome} no WhatsApp`}>
          <ZapIcone />Enviar mensagem
        </a>
      </div>
    </article>
  )
}
