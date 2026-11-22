import { useEffect, useRef, useState } from 'react'
import { supabase, urlFoto } from '../lib/supabase'
import { prepararFoto } from '../lib/imagem'
import { BUCKET_FOTOS } from '../config'

const NUMS = Array.from({ length: 14 }, (_, i) => 33 + i)
const TIPOS = ['image/jpeg', 'image/png', 'image/webp']
const LIMITE = 15 * 1024 * 1024 // antes de reduzir; depois de reduzida fica bem abaixo de 5 MB

export default function FormAnuncio({ item, categorias, marcas, onFechar, onSalvo }) {
  const [nome, setNome] = useState(item?.nome ?? '')
  const [marca, setMarca] = useState(item?.marca ?? '')
  const [categoriaId, setCategoriaId] = useState(item?.categoria_id ?? '')
  const [preco, setPreco] = useState(item?.preco ?? '')
  const [promo, setPromo] = useState(item?.preco_promocional ?? '')
  const [tamanhos, setTamanhos] = useState(item?.tamanhos ?? [])
  const [descricao, setDescricao] = useState(item?.descricao ?? '')
  const [ativo, setAtivo] = useState(item?.ativo ?? true)
  // cada foto: { caminho } já salva ou { arquivo, url } nova
  const [fotos, setFotos] = useState((item?.fotos ?? []).map((c) => ({ caminho: c, url: urlFoto(c) })))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const erroRef = useRef(null)
  const nomeRef = useRef(null)

  useEffect(() => {
    nomeRef.current?.focus()
    const esc = (e) => e.key === 'Escape' && !salvando && onFechar()
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onFechar, salvando])

  useEffect(() => () => fotos.forEach((f) => f.arquivo && URL.revokeObjectURL(f.url)), []) // eslint-disable-line

  useEffect(() => { if (erro) erroRef.current?.scrollIntoView({ block: 'nearest' }) }, [erro])

  function adicionar(e) {
    const arqs = [...e.target.files]
    const ok = arqs.filter((a) => TIPOS.includes(a.type) && a.size <= LIMITE)
    if (ok.length < arqs.length) setErro('Algumas fotos foram ignoradas. Use JPG, PNG ou WEBP de até 15 MB.')
    setFotos((fs) => [...fs, ...ok.map((a) => ({ arquivo: a, url: URL.createObjectURL(a) }))])
    e.target.value = ''
  }

  const mover = (k, d) => setFotos((fs) => {
    const n = k + d
    if (n < 0 || n >= fs.length) return fs
    const c = [...fs];[c[k], c[n]] = [c[n], c[k]]; return c
  })

  async function salvar(e) {
    e.preventDefault()
    const p = parseFloat(preco), pp = promo === '' ? null : parseFloat(promo)
    const falta = []
    if (!fotos.length) falta.push('pelo menos uma foto')
    if (!nome.trim()) falta.push('o nome')
    if (!marca.trim()) falta.push('a marca')
    if (!categoriaId) falta.push('a categoria')
    if (!(p > 0)) falta.push('o preço')
    if (!tamanhos.length) falta.push('as numerações')
    if (falta.length) return setErro(`Falta preencher: ${falta.join(', ')}.`)
    if (pp != null && !(pp > 0 && pp < p)) return setErro('O preço promocional precisa ser maior que zero e menor que o preço normal.')

    setSalvando(true); setErro('')
    const id = item?.id ?? crypto.randomUUID()
    const enviadas = []
    try {
      // marca: usa a existente com o mesmo nome ou cria
      let marcaId = marcas.find((m) => m.nome.toLowerCase() === marca.trim().toLowerCase())?.id
      if (!marcaId) {
        const { data, error } = await supabase.from('marcas').insert({ nome: marca.trim() }).select('id').single()
        if (error) throw error
        marcaId = data.id
      }

      // fotos novas: reduz e envia, mantendo a ordem escolhida
      const caminhos = []
      for (const f of fotos) {
        if (f.caminho) { caminhos.push(f.caminho); continue }
        const blob = await prepararFoto(f.arquivo)
        const caminho = `${id}/${crypto.randomUUID()}.webp`
        const { error } = await supabase.storage.from(BUCKET_FOTOS).upload(caminho, blob, { contentType: 'image/webp', cacheControl: '31536000' })
        if (error) throw error
        enviadas.push(caminho); caminhos.push(caminho)
      }

      const dados = {
        nome: nome.trim(), descricao: descricao.trim() || null, preco: p, preco_promocional: pp,
        categoria_id: Number(categoriaId), marca_id: marcaId, tamanhos: [...tamanhos].sort((a, b) => a - b),
        fotos: caminhos, ativo,
      }
      const { error } = item
        ? await supabase.from('produtos').update(dados).eq('id', id)
        : await supabase.from('produtos').insert({ id, ...dados })
      if (error) throw error

      // apaga do bucket as fotos que foram removidas na edição
      const removidas = (item?.fotos ?? []).filter((c) => !caminhos.includes(c))
      if (removidas.length) await supabase.storage.from(BUCKET_FOTOS).remove(removidas)

      onSalvo(!item)
    } catch (err) {
      console.error(err)
      if (enviadas.length) await supabase.storage.from(BUCKET_FOTOS).remove(enviadas)
      setErro('Não foi possível salvar. Confira sua conexão e tente de novo.')
      setSalvando(false)
    }
  }

  const titulo = item ? 'Editar anúncio' : 'Novo anúncio'
  return (
    <>
      <div className="fundo" onClick={() => !salvando && onFechar()} />
      <form className="gaveta" role="dialog" aria-modal="true" aria-label={titulo} onSubmit={salvar} noValidate>
        <div className="g-topo"><h3>{titulo}</h3><button className="ico" type="button" aria-label="Fechar" onClick={onFechar} disabled={salvando}>&#10005;</button></div>
        <div className="g-corpo">
          <div>
            <label>Fotos <span className="dica">A primeira é a capa. Use as setas pra mudar a ordem.</span></label>
            <div className="fotos" style={{ marginTop: 8 }}>
              {fotos.map((f, k) => (
                <div className="foto" key={f.url}>
                  <img src={f.url} alt={`Foto ${k + 1}`} />
                  {k === 0 && <span className="capa">Capa</span>}
                  <div className="ctl">
                    <button type="button" aria-label="Mover pra esquerda" onClick={() => mover(k, -1)}>&#8249;</button>
                    <button type="button" aria-label="Remover foto" onClick={() => setFotos((fs) => fs.filter((_, j) => j !== k))}>&#10005;</button>
                    <button type="button" aria-label="Mover pra direita" onClick={() => mover(k, 1)}>&#8250;</button>
                  </div>
                </div>
              ))}
              <label className="add">+ Adicionar fotos<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={adicionar} /></label>
            </div>
          </div>
          <label htmlFor="g-nome">Nome do produto<input ref={nomeRef} type="text" id="g-nome" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Tênis Casual Branco" maxLength={120} /></label>
          <div className="dupla">
            <label htmlFor="g-marca">Marca<input type="text" id="g-marca" list="g-marcas" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Escolha ou digite" maxLength={60} />
              <datalist id="g-marcas">{marcas.map((m) => <option key={m.id} value={m.nome} />)}</datalist></label>
            <label htmlFor="g-cat">Categoria<select id="g-cat" value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              <option value="">{categorias.length ? 'Escolha' : 'Nenhuma categoria cadastrada'}</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}</select>
              {!categorias.length && <span className="dica">Cadastre as categorias no Supabase (tabela categorias) e atualize a página.</span>}</label>
          </div>
          <div className="dupla">
            <label htmlFor="g-preco">Preço (R$)<input type="number" id="g-preco" min="0" step="0.01" inputMode="decimal" value={preco} onChange={(e) => setPreco(e.target.value)} /></label>
            <label htmlFor="g-promo">Preço promocional (R$) <span className="dica">Preencha pra entrar no carrossel de promoções.</span>
              <input type="number" id="g-promo" min="0" step="0.01" inputMode="decimal" value={promo ?? ''} onChange={(e) => setPromo(e.target.value)} /></label>
          </div>
          <div>
            <label>Numerações disponíveis</label>
            <div className="nnums" style={{ marginTop: 8 }}>
              {NUMS.map((n) => (
                <button key={n} type="button" className="nnum" aria-pressed={tamanhos.includes(n)}
                  onClick={() => setTamanhos((t) => (t.includes(n) ? t.filter((x) => x !== n) : [...t, n]))}>{n}</button>
              ))}
            </div>
          </div>
          <label htmlFor="g-desc">Descrição<textarea id="g-desc" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Material, solado, como veste..." maxLength={1500} /></label>
          <label className="chave" htmlFor="g-ativo"><span><strong>Anúncio no ar</strong><span className="dica">Desligado, ele fica salvo mas some da vitrine.</span></span>
            <input type="checkbox" id="g-ativo" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} /></label>
          {erro && <p className="erro" ref={erroRef} role="alert">{erro}</p>}
        </div>
        <div className="g-pe">
          <button className="btn sec" type="button" onClick={onFechar} disabled={salvando}>Cancelar</button>
          <button className="btn" type="submit" disabled={salvando}>{salvando ? 'Salvando...' : item ? 'Salvar alterações' : 'Publicar anúncio'}</button>
        </div>
      </form>
    </>
  )
}
