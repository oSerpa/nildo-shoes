import { brl, precoFinal } from '../lib/format'

export default function Etiqueta({ p }) {
  return (
    <>
      <span className="etq">{brl(precoFinal(p))}</span>
      {p.preco_promocional != null && <span className="de">{brl(p.preco)}</span>}
    </>
  )
}
