import { FormEvent, useState } from 'react'
import { supabase } from '../lib/supabase'

type Props = { onLoggedIn: () => void }

export function Login({ onLoggedIn }: Props) {
  const [email, setEmail] = useState('ramon@pa.com')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      setError('Não foi possível entrar. Confira e-mail e senha.')
      return
    }

    onLoggedIn()
  }

  return (
    <main className="center-page">
      <form className="card login-card" onSubmit={handleSubmit}>
        <h1>Vencimento PA</h1>
        <p>Entre com seu usuário do aplicativo.</p>

        <label>E-mail</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />

        <label>Senha</label>
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />

        {error && <div className="error-box">{error}</div>}

        <button disabled={loading} type="submit">
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  )
}
