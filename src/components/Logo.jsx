export default function Logo({ href = '/' }) {
  return (
    <a className="logo" href={href} aria-label="Nildo Shoes">
      <b>N<span>i</span>ldo</b>
      <i>Shoes</i>
    </a>
  )
}
