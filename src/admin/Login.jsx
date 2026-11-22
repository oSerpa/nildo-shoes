import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'

export default function Login({ aviso }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    if (!email.trim() || !senha) { setErro('Preencha e-mail e senha.'); return }
    setEnviando(true); setErro('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
    setEnviando(false)
    if (error) setErro(error.status === 429 ? 'Muitas tentativas. Espere alguns minutos e tente de novo.' : 'E-mail ou senha incorretos.')
  }

  return (
    <div className="wrap login">
      <form onSubmit={entrar} noValidate>
        <Logo />
        <div><h1>Painel da loja</h1><p>Entre pra publicar e editar anúncios.</p></div>
        <label htmlFor="l-email">E-mail
          <input type="email" id="l-email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label htmlFor="l-senha">Senha
          <input type="password" id="l-senha" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {(erro || aviso) && <p className="erro" role="alert">{erro || aviso}</p>}
        <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <div className="cadeado">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          Acesso restrito aos administradores. Não existe cadastro público.
        </div>
      </form>
    </div>
  )
}
