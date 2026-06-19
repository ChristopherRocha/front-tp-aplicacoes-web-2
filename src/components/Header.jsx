import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  return (
    <header className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm app-navbar">
      <div className="container-xxl">
        <NavLink className="navbar-brand fw-bold" to="/">
          Movie.rar
        </NavLink>
        <nav className="navbar-nav ms-auto app-navbar-list" aria-label="Navegacao principal">
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>
          <NavLink
            to="/filmes"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Filmes
          </NavLink>
          <NavLink
            to="/generos"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Generos
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
