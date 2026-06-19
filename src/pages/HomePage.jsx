import { useRef } from 'react'
import MovieCard from '../components/MovieCard'

function HomePage({ filmes, generos, loading, error, generoById, getImageUrl }) {
  const recentRowRef = useRef(null)
  const genreRowRefs = useRef({})

  if (loading) {
    return <p className="status">Carregando filmes...</p>
  }

  if (error) {
    return <p className="status status-error">{error}</p>
  }

  if (filmes.length === 0) {
    return <p className="status">Nenhum filme encontrado.</p>
  }

  const recentMovies = [...filmes]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 6)

  const scrollRow = (row, direction) => {
    if (!row) {
      return
    }

    const amount = row.parentElement?.clientWidth || row.clientWidth
    row.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  const setGenreRowRef = (id) => (node) => {
    if (node) {
      genreRowRefs.current[id] = node
    }
  }

  const genresWithMovies = generos
    .map((genero) => {
      const movies = filmes.filter((filme) => filme.generoId === genero.id)
      return {
        ...genero,
        movies,
      }
    })
    .filter((genero) => genero.movies.length > 0)

  return (
    <section className="d-grid gap-4">
      <div className="d-grid gap-5">
        <div className="d-flex align-items-center justify-content-between">
          <h2 className="h4 mb-0">Adicionados recentemente</h2>
          <span className="text-muted small">{recentMovies.length} filmes</span>
        </div>
        <div className="carousel-row d-flex align-items-center">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm carousel-nav prev"
            aria-label="Voltar filmes recentes"
            onClick={() => scrollRow(recentRowRef.current, 'left')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
              <path d="M15.4 4.6 8.9 11l6.5 6.4-1.4 1.4L6.1 11l7.9-7.8 1.4 1.4Z" />
            </svg>
          </button>
          <div className="carousel-window">
            <div className="carousel-track" ref={recentRowRef}>
              {recentMovies.map((filme) => (
                <MovieCard
                  key={filme.id}
                  filme={filme}
                  generoDescricao={generoById[filme.generoId]}
                  imageUrl={getImageUrl(filme)}
                  showActions={false}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm carousel-nav next"
            aria-label="Avancar filmes recentes"
            onClick={() => scrollRow(recentRowRef.current, 'right')}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
              <path d="M8.6 19.4 15.1 13 8.6 6.6 10 5.2 17.9 13 10 20.8l-1.4-1.4Z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="d-grid gap-3">
        <div className="d-flex align-items-center justify-content-between">
          <h2 className="h4 mb-0">Por gênero</h2>
        </div>
        {genresWithMovies.length === 0 && <p className="status">Nenhum gênero com filmes.</p>}

        {genresWithMovies.map((genero) => (
          <div key={genero.id} className="d-grid gap-2">
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="h6 mb-0">{genero.descricao}</h3>
              <span className="text-muted small">{genero.movies.length} filme(s)</span>
            </div>
            <div className="carousel-row d-flex align-items-center">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm carousel-nav prev"
                aria-label={`Voltar filmes de ${genero.descricao}`}
                onClick={() => scrollRow(genreRowRefs.current[genero.id], 'left')}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                  <path d="M15.4 4.6 8.9 11l6.5 6.4-1.4 1.4L6.1 11l7.9-7.8 1.4 1.4Z" />
                </svg>
              </button>
              <div className="carousel-window">
                <div className="carousel-track" ref={setGenreRowRef(genero.id)}>
                  {genero.movies.map((filme) => (
                    <MovieCard
                      key={filme.id}
                      filme={filme}
                      generoDescricao={generoById[filme.generoId]}
                      imageUrl={getImageUrl(filme)}
                      showActions={false}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm carousel-nav next"
                aria-label={`Avancar filmes de ${genero.descricao}`}
                onClick={() => scrollRow(genreRowRefs.current[genero.id], 'right')}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                  <path d="M8.6 19.4 15.1 13 8.6 6.6 10 5.2 17.9 13 10 20.8l-1.4-1.4Z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default HomePage
