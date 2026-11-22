import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Login from './Login'
import Painel from './Painel'
import '../styles/vitrine.css'
import '../styles/admin.css'

// Rota /admin. Quem garante a segurança são as regras do banco (schema.sql):
// esta tela só decide o que mostrar.
export default function Admin() {
  const [sessao, setSessao] = useState(undefined) // undefined = verificando
  const [admin, setAdmin] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    document.title = 'Painel | Nildo Shoes'
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => { data.subscription.unsubscribe(); document.title = 'Nildo Shoes' }
  }, [])

  useEffect(() => {
    if (!sessao) { setAdmin(false); return }
    supabase.rpc('is_admin').then(({ data, error }) => {
      if (error || !data) {
        setAviso('Esta conta não tem permissão para acessar o painel.')
        supabase.auth.signOut()
      } else {
        setAviso('')
        setAdmin(true)
      }
    })
  }, [sessao])

  return (
    <div className="adm">
      {sessao === undefined || (sessao && !admin && !aviso)
        ? <div className="carregando">Carregando...</div>
        : sessao && admin
          ? <Painel email={sessao.user.email} />
          : <Login aviso={aviso} />}
    </div>
  )
}
