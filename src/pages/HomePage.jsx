import { useMemo, useRef } from 'react'
import MovieCard from '../components/MovieCard'
import heroImage from '../assets/hero.png'

function HomePage({
  jogos,
  generos,
  loading,
  error,
  isAuthenticated,
  generoById,
  getImageUrl,
  onOpenDetails,
  onLogin,
  onRegister,
}) {
  const topRatedRowRef = useRef(null)
  const mostCommentedRowRef = useRef(null)
  const recentRowRef = useRef(null)

  const homeData = useMemo(() => {
    const totalAvaliacoes = jogos.reduce((total, jogo) => total + Number(jogo.avaliacoesCount || 0), 0)
    const totalComentarios = jogos.reduce((total, jogo) => total + Number(jogo.comentariosCount || 0), 0)
    const topRated = [...jogos]
      .filter((jogo) => jogo.avaliacaoMedia !== null && jogo.avaliacaoMedia !== undefined)
      .sort((a, b) => {
        const ratingDiff = Number(b.avaliacaoMedia || 0) - Number(a.avaliacaoMedia || 0)
        return ratingDiff || Number(b.avaliacoesCount || 0) - Number(a.avaliacoesCount || 0)
      })
      .slice(0, 8)
    const mostCommented = [...jogos]
      .sort((a, b) => Number(b.comentariosCount || 0) - Number(a.comentariosCount || 0))
      .slice(0, 8)
    const recentGames = [...jogos]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA || Number(b.id || 0) - Number(a.id || 0)
      })
      .slice(0, 8)

    return {
      totalAvaliacoes,
      totalComentarios,
      topRated,
      mostCommented,
      recentGames,
    }
  }, [jogos])

  const scrollRow = (row, direction) => {
    if (!row) {
      return
    }

    const amount = row.parentElement?.clientWidth || row.clientWidth
    row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const renderRail = (title, subtitle, items, rowRef) => (
    <section className="home-rail" aria-labelledby={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>
      <div className="section-heading">
        <div>
          <h2 id={`${title.replace(/\s+/g, '-').toLowerCase()}-title`}>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <span>{items.length} jogos</span>
      </div>

      {items.length === 0 ? (
        <p className="empty-inline">Ainda nao ha dados suficientes.</p>
      ) : (
        <div className="carousel-row d-flex align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm carousel-nav prev"
            aria-label={`Voltar ${title}`}
            onClick={() => scrollRow(rowRef.current, 'left')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
              <path d="M15.4 4.6 8.9 11l6.5 6.4-1.4 1.4L6.1 11l7.9-7.8 1.4 1.4Z" />
            </svg>
          </button>
          <div className="carousel-window">
            <div className="carousel-track" ref={rowRef}>
              {items.map((jogo) => (
                <MovieCard
                  key={jogo.id}
                  jogo={jogo}
                  generoDescricao={generoById[jogo.generoId]}
                  imageUrl={getImageUrl(jogo)}
                  onOpenDetails={onOpenDetails}
                  showActions={false}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm carousel-nav next"
            aria-label={`Avancar ${title}`}
            onClick={() => scrollRow(rowRef.current, 'right')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
              <path d="M8.6 19.4 15.1 13 8.6 6.6 10 5.2 17.9 13 10 20.8l-1.4-1.4Z" />
            </svg>
          </button>
        </div>
      )}
    </section>
  )

  if (!isAuthenticated) {
    return (
      <section className="auth-welcome">
        <div>
          <p className="eyebrow">Avaliacoes de games</p>
          <h1>GameCritic</h1>
          <p>
            Entre para acompanhar jogos avaliados pela comunidade e publicar suas opinioes.
          </p>
        </div>
        <img className="auth-visual" src={heroImage} alt="" aria-hidden="true" />
        <div className="auth-welcome-actions">
          <button type="button" className="btn btn-primary" onClick={onLogin}>
            Entrar
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={onRegister}>
            Criar conta
          </button>
        </div>
      </section>
    )
  }

  if (loading) {
    return <p className="status">Carregando jogos...</p>
  }

  if (error) {
    return <p className="status status-error">{error}</p>
  }

  return (
    <section className="home-page">
      <section className="home-summary" aria-label="Resumo da plataforma">
        <div>
          <p className="eyebrow">Visao geral</p>
          <h1>Jogos avaliados pela comunidade</h1>
        </div>
        <div className="summary-grid">
          <div className="summary-item">
            <span>{jogos.length}</span>
            <p>Jogos</p>
          </div>
          <div className="summary-item">
            <span>{generos.length}</span>
            <p>Generos</p>
          </div>
          <div className="summary-item">
            <span>{homeData.totalAvaliacoes}</span>
            <p>Avaliacoes</p>
          </div>
          <div className="summary-item">
            <span>{homeData.totalComentarios}</span>
            <p>Comentarios</p>
          </div>
        </div>
      </section>

      {jogos.length === 0 ? (
        <p className="status">Nenhum jogo cadastrado ainda.</p>
      ) : (
        <>
          {renderRail(
            'Mais bem avaliados',
            'Ordenados pela media das notas e volume de avaliacoes.',
            homeData.topRated,
            topRatedRowRef,
          )}
          {renderRail(
            'Mais comentados',
            'Jogos com mais interacao dos usuarios.',
            homeData.mostCommented,
            mostCommentedRowRef,
          )}
          {renderRail(
            'Adicionados recentemente',
            'Novos inserts de jogos cadastrados na plataforma.',
            homeData.recentGames,
            recentRowRef,
          )}
        </>
      )}
    </section>
  )
}

export default HomePage
