import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Login } from './pages/Login'
import { BatidaHoje } from './pages/BatidaHoje'
import { Acompanhamento } from './pages/Acompanhamento'
import { Promotores } from './pages/Promotores'
import { RealtimeNotifications } from './components/RealtimeNotifications'

const menuItems = [
  { label: 'Painel', icon: '⌂' },
  { label: 'Operação', icon: '▣' },
  { label: 'Acompanhamento', icon: '▥' },
  { label: 'Promotores', icon: '🏪' },
  { label: 'FEFO', icon: '↻' },
  { label: 'Relatórios', icon: '▤' },
  { label: 'Administração', icon: '⚙' },
]

export default function App() {
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('Operação')

  useEffect(() => {
    void loadSession()
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  async function loadSession() {
    const { data } = await supabase.auth.getSession()
    setUserId(data.session?.user.id ?? null)
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setUserId(null)
  }

  if (loading) return <main className="center-page"><div className="loading-card">Carregando Vencimento PA...</div></main>
  if (!userId) return <Login onLoggedIn={loadSession} />

  return (
    <div className="pa-layout">
      <aside className="pa-sidebar">
        <div className="brand-block">
          <div className="brand-mark">PA</div>
          <div>
            <strong>Vencimento PA</strong>
            <span>Lugar de Gente Feliz</span>
          </div>
        </div>
        <nav className="main-nav" aria-label="Navegação principal">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeMenu === item.label ? 'active' : ''}`}
              onClick={() => setActiveMenu(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="online-dot" /> Sistema conectado
          <button className="logout-link" onClick={logout}>↪ Sair</button>
        </div>
      </aside>

      <main className="pa-content">
        <header className="pa-topbar">
          <div>
            <span className="breadcrumb">Vencimento PA / {activeMenu}</span>
            <h1>{activeMenu === 'Operação' ? 'Operação' : activeMenu}</h1>
          </div>
          <div className="user-chip"><span className="avatar">R</span><span>Ramon</span></div>
        </header>

        <section className="welcome-strip">
          <div>
            <span className="eyebrow">Visão geral</span>
            <h2>Olá, Ramon! Vamos cuidar das validades?</h2>
            <p>Organize suas batidas, acompanhe os produtos e mantenha a operação em dia.</p>
          </div>
          <div className="welcome-badge">● Sistema ativo</div>
        </section>

        <RealtimeNotifications userId={userId} />

        <section className="summary-grid">
          <article className="summary-card green"><span>✓</span><div><strong>Batida de hoje</strong><small>Controle diário</small></div></article>
          <article className="summary-card blue"><span>▣</span><div><strong>Produtos</strong><small>Registros da operação</small></div></article>
          <article className="summary-card orange"><span>!</span><div><strong>Vencimentos</strong><small>Atenção às datas</small></div></article>
          <article className="summary-card purple"><span>▥</span><div><strong>Progresso</strong><small>Acompanhamento</small></div></article>
        </section>

        {activeMenu === 'Operação' || activeMenu === 'Painel' ? (
          <BatidaHoje userId={userId} onLogout={logout} />
        ) : activeMenu === 'Acompanhamento' ? (
          <Acompanhamento />
        ) : activeMenu === 'Promotores' ? (
          <Promotores userId={userId} />
        ) : (
          <section className="card coming-card">
            <span className="eyebrow">Módulo em construção</span>
            <h2>{activeMenu}</h2>
            <p>Esta área será integrada gradualmente ao banco Supabase. A operação de batidas continua disponível pelo menu Operação.</p>
            <button onClick={() => setActiveMenu('Operação')}>Voltar para Operação</button>
          </section>
        )}
      </main>
    </div>
  )
}
