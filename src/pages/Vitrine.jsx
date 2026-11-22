import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase, normalizar, SELECT_PRODUTO } from '../lib/supabase'
import { precoFinal, linkWhatsAppLoja } from '../lib/format'
import { LOJA } from '../config'
import Logo from '../components/Logo'
import Promocoes from '../components/Promocoes'
import Filtros, { FiltrosAplicados } from '../components/Filtros'
import ProdutoCard from '../components/ProdutoCard'
import ProdutoDetalhe from '../components/ProdutoDetalhe'
import '../styles/vitrine.css'

export default function Vitrine() {
  const [produtos, setProdutos] = useState([])
  const [estado, setEstado] = useState('carregando')
  const [filtro, setFiltro] = useState({ cat: 'Todas', tam: '', marca: '', preco: '' })
  const [aberto, setAberto] = useState(null)

  useEffect(() => {
    supabase.from('produtos').select(SELECT_PRODUTO).eq('ativo', true).order('criado_em', { ascending: false })
      .then(({ data, error }) => {
        if (error) { console.error(error); setEstado('erro'); return }
        setProdutos(data.map(normalizar))
        setEstado('ok')
      })
  }, [])

  const lista = useMemo(() => {
    const [min, max] = filtro.preco ? filtro.preco.split('-').map(Number) : [0, Infinity]
    return produtos.filter((p) =>
      (filtro.cat === 'Todas' || p.categoria === filtro.cat) &&
      (!filtro.marca || p.marca === filtro.marca) &&
      (!filtro.tam || p.tamanhos.includes(Number(filtro.tam))) &&
      precoFinal(p) >= min && precoFinal(p) < max)
  }, [produtos, filtro])

  const promos = useMemo(() => produtos.filter((p) => p.preco_promocional != null), [produtos])
  const fechar = useCallback(() => setAberto(null), [])

  return (
    <>
      <header className="site-header">
        <div className="wrap top">
          <Logo />
          <div className="contact">
            <span>Pedidos pelo WhatsApp</span>
            <a href={linkWhatsAppLoja()} target="_blank" rel="noopener noreferrer"><strong>{LOJA.whatsappExibicao}</strong></a>
          </div>
        </div>
      </header>

      <Promocoes produtos={promos} onAbrir={setAberto} pausado={!!aberto} />

      {produtos.length > 0 && <Filtros produtos={produtos} filtro={filtro} setFiltro={setFiltro} total={lista.length} />}

      <main className="wrap">
        <div className="count">
          <h2>{filtro.cat === 'Todas' ? 'Todos os calçados' : filtro.cat}</h2>
          {estado === 'ok' && <span>{lista.length} {lista.length === 1 ? 'modelo' : 'modelos'}</span>}
        </div>
        <FiltrosAplicados filtro={filtro} setFiltro={setFiltro} />

        {estado === 'carregando' && <div className="grid">{[0, 1, 2, 3].map((k) => <div key={k} className="esq" />)}</div>}
        {estado === 'erro' && <div className="estado">Não foi possível carregar os calçados agora. Atualize a página ou chame no WhatsApp.</div>}
        {estado === 'ok' && produtos.length === 0 && <div className="estado">Novidades chegando. Enquanto isso, chame no WhatsApp pra saber o que tem.</div>}
        {estado === 'ok' && produtos.length > 0 && lista.length === 0 && <div className="estado">Nenhum calçado com esses filtros. Tente tirar algum.</div>}

        <div className="grid">
          {lista.map((p) => <ProdutoCard key={p.id} p={p} onAbrir={setAberto} />)}
        </div>
      </main>

      <footer>
        <div className="wrap">
          <Logo />
          <div>Pedidos e dúvidas pelo WhatsApp {LOJA.whatsappExibicao}.</div>
        </div>
      </footer>

      {aberto && <ProdutoDetalhe p={aberto} onFechar={fechar} />}
    </>
  )
}
