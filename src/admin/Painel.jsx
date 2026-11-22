import { useCallback, useEffect, useState } from 'react'
import { supabase, normalizar, SELECT_PRODUTO } from '../lib/supabase'
import { brl, faixaNumeracao } from '../lib/format'
import { BUCKET_FOTOS } from '../config'
import Logo from '../components/Logo'
import FormAnuncio from './FormAnuncio'

const I = {
  edit: <svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></svg>,
  del: <svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>,
}

export default function Painel({ email }) {
  const [itens, setItens] = useState(null)
  const [categorias, setCategorias] = useState([])
  const [marcas, setMarcas] = useState([])
  const [q, setQ] = useState('')
  const [st, setSt] = useState('')
  const [confirmando, setConfirmando] = useState(null)
  const [editando, setEditando] = useState(null) // null fechado, {} novo, produto = editar
  const [toast, setToast] = useState('')
  const [erro, setErro] = useState('')

  const avisar = (t) => { setToast(t); setTimeout(() => setToast(''), 2600) }

  const carregar = useCallback(async () => {
    const [p, c, m] = await Promise.all([
      supabase.from('produtos').select(SELECT_PRODUTO).order('criado_em', { ascending: false }),
      supabase.from('categorias').select('id, nome').order('nome'),
      supabase.from('marcas').select('id, nome').order('nome'),
    ])
    if (p.error || c.error || m.error) { setErro('Não foi possível carregar os anúncios. Atualize a página.'); return }
    setItens(p.data.map(normalizar)); setCategorias(c.data); setMarcas(m.data); setErro('')
  }, [])

  useEffect(() => { carregar() }, [carregar])

  async function alternar(i) {
    const { error } = await supabase.from('produtos').update({ ativo: !i.ativo }).eq('id', i.id)
    if (error) return avisar('Não foi possível alterar. Tente de novo.')
    setItens((xs) => xs.map((x) => (x.id === i.id ? { ...x, ativo: !i.ativo } : x)))
    avisar(i.ativo ? 'Anúncio pausado' : 'Anúncio no ar')
  }

  async function excluir(i) {
    const { error } = await supabase.from('produtos').delete().eq('id', i.id)
    if (error) return avisar('Não foi possível excluir. Tente de novo.')
    if (i.fotos?.length) await supabase.storage.from(BUCKET_FOTOS).remove(i.fotos)
    setItens((xs) => xs.filter((x) => x.id !== i.id)); setConfirmando(null)
    avisar('Anúncio excluído')
  }

  const vis = (itens ?? []).filter((i) =>
    (!q || `${i.nome} ${i.marca}`.toLowerCase().includes(q.toLowerCase())) &&
    (!st || (st === 'on' && i.ativo) || (st === 'off' && !i.ativo) || (st === 'promo' && i.preco_promocional != null)))

  return (
    <>
      <div className="barra"><div className="wrap">
        <Logo href="/admin" />
        <div className="quem"><span>{email}</span><a className="btn sec" href="/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Ver site</a>
          <button className="btn sec" type="button" onClick={() => supabase.auth.signOut()}>Sair</button></div>
      </div></div>
      <main className="wrap">
        <div className="topo">
          <div><h2>Anúncios</h2>
            {itens && <div className="resumo"><span>{itens.length} anúncios</span><span>{itens.filter((i) => i.ativo).length} no ar</span><span>{itens.filter((i) => i.preco_promocional != null).length} em promoção</span></div>}
          </div>
          <button className="btn" type="button" onClick={() => setEditando({})}>+ Novo anúncio</button>
        </div>
        <div className="busca">
          <input type="text" placeholder="Buscar por nome ou marca" aria-label="Buscar" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Status" value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">Todos</option><option value="on">No ar</option><option value="off">Pausados</option><option value="promo">Em promoção</option>
          </select>
        </div>
        <div className="lista">
          {erro && <div className="vazio">{erro}</div>}
          {!erro && !itens && <div className="carregando">Carregando anúncios...</div>}
          {itens && !vis.length && <div className="vazio">{itens.length ? 'Nenhum anúncio com essa busca.' : 'Nenhum anúncio ainda. Clique em Novo anúncio pra publicar o primeiro.'}</div>}
          {vis.map((i) => (
            <div key={i.id} className={`item${i.ativo ? '' : ' pausado'}`}>
              <img className="thumb" src={i.fotosUrl[0]} alt="" />
              <div className="info"><strong>{i.nome}</strong><small>{i.marca} · {i.categoria} · {faixaNumeracao(i.tamanhos)}</small></div>
              <div className="precos">{i.preco_promocional != null ? <><s>{brl(i.preco)}</s><span className="promo">{brl(i.preco_promocional)}</span></> : brl(i.preco)}</div>
              <div className="acoes">
                <button className={`status ${i.ativo ? 'on' : 'off'}`} type="button" onClick={() => alternar(i)}>{i.ativo ? 'No ar' : 'Pausado'}</button>
                <button className="ico" type="button" aria-label={`Editar ${i.nome}`} onClick={() => setEditando(i)}>{I.edit}</button>
                <button className="ico" type="button" aria-label={`Excluir ${i.nome}`} onClick={() => setConfirmando(i.id)}>{I.del}</button>
              </div>
              {confirmando === i.id && (
                <div className="confirma"><span>Excluir "{i.nome}"? As fotos também serão apagadas.</span>
                  <div><button className="btn sec" type="button" onClick={() => setConfirmando(null)}>Cancelar</button>
                    <button className="btn perigo" type="button" onClick={() => excluir(i)}>Excluir</button></div></div>
              )}
            </div>
          ))}
        </div>
      </main>
      {editando && (
        <FormAnuncio item={editando.id ? editando : null} categorias={categorias} marcas={marcas}
          onFechar={() => setEditando(null)}
          onSalvo={(novo) => { setEditando(null); carregar(); avisar(novo ? 'Anúncio publicado' : 'Alterações salvas') }} />
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}
