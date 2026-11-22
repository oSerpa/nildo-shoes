import { useRef, useState } from 'react'

// Carrossel de fotos de um produto: setas no computador, arrastar no celular
export default function Carrossel({ fotos, alt, children }) {
  const [i, setI] = useState(0)
  const x0 = useRef(null)
  const arrastou = useRef(false)
  const total = fotos.length || 1
  const ir = (n) => setI((n + total) % total)

  const seta = (dir) => (e) => {
    e.stopPropagation()
    ir(i + dir)
  }

  return (
    <div
      className="car"
      onPointerDown={(e) => { x0.current = e.clientX; arrastou.current = false }}
      onPointerUp={(e) => {
        if (x0.current == null) return
        const dx = e.clientX - x0.current
        if (Math.abs(dx) > 35) { arrastou.current = true; ir(i + (dx < 0 ? 1 : -1)) }
        x0.current = null
      }}
      onClickCapture={(e) => { if (arrastou.current) { e.stopPropagation(); arrastou.current = false } }}
    >
      <div className="track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {fotos.map((f, k) => (
          <img key={f + k} src={f} alt={`${alt}, foto ${k + 1}`} draggable="false" loading={k ? 'lazy' : 'eager'} />
        ))}
      </div>
      {fotos.length > 1 && (
        <>
          <button className="nav prev" type="button" aria-label="Foto anterior" onClick={seta(-1)}>&#8249;</button>
          <button className="nav next" type="button" aria-label="Próxima foto" onClick={seta(1)}>&#8250;</button>
          <div className="dots">{fotos.map((_, k) => <i key={k} className={k === i ? 'on' : ''} />)}</div>
        </>
      )}
      {children}
    </div>
  )
}
