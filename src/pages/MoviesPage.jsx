import MovieCard from '../components/MovieCard'

function MoviesPage({
  filmes,
  loading,
  error,
  search,
  onSearchChange,
  generoById,
  getImageUrl,
  onCreateMovie,
  onEditMovie,
  onDeleteMovie,
  deletingMovieId,
}) {
  return (
    <section className="d-grid gap-3">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3">
        <button type="button" className="btn btn-success" onClick={onCreateMovie}>
          Adicionar filme
        </button>

        <div className="d-grid gap-1">
          <label className="form-label mb-0" htmlFor="movie-search">
            Buscar
          </label>
          <input
            id="movie-search"
            type="text"
            className="form-control"
            placeholder="Digite um titulo"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </div>

      {loading && <p className="status">Carregando filmes...</p>}

      {!loading && error && <p className="status status-error">{error}</p>}

      {!loading && !error && filmes.length === 0 && (
        <p className="status">Nenhum filme encontrado.</p>
      )}

      {!loading && !error && filmes.length > 0 && (
        <section className="d-flex flex-wrap gap-3" aria-label="Lista de filmes">
          {filmes.map((filme) => (
            <MovieCard
              key={filme.id}
              filme={filme}
              generoDescricao={generoById[filme.generoId]}
              imageUrl={getImageUrl(filme)}
              onEdit={onEditMovie}
              onDelete={onDeleteMovie}
              isDeleting={deletingMovieId === filme.id}
            />
          ))}
        </section>
      )}
    </section>
  )
}

export default MoviesPage
