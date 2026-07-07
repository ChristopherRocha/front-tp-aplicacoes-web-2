import { NavLink } from 'react-router-dom'
import './Header.css'

function Header({ user, isAdmin, onLogin, onRegister, onLogout }) {
  return (
    <header className="navbar navbar-expand-lg navbar-dark fixed-top shadow-sm app-navbar">
      <div className="container-xxl">
        <NavLink className="navbar-brand fw-bold" to="/">
          GameCritic
        </NavLink>
        <nav className="navbar-nav ms-auto app-navbar-list" aria-label="Navegacao principal">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>
          <NavLink
            to="/jogos"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Jogos
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/generos"
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              Generos
            </NavLink>
          )}
        </nav>
        <div className="app-auth-actions">
          {user ? (
            <>
              <span className="app-auth-user" title={user.email}>
                {user.nome}
                <small>{user.role === 'admin' ? 'Admin' : 'User'}</small>
              </span>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={onLogout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <button type="button" className="btn btn-outline-light btn-sm" onClick={onLogin}>
                Entrar
              </button>
              <button type="button" className="btn btn-primary btn-sm" onClick={onRegister}>
                Criar conta
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
