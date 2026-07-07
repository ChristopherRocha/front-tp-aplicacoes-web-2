import MovieCard from '../components/MovieCard'

function MoviesPage({
  jogos,
  loading,
  error,
  search,
  isAuthenticated,
  onSearchChange,
  generoById,
  getImageUrl,
  onCreateGame,
  onOpenDetails,
  onEditGame,
  onDeleteGame,
  deletingGameId,
  canManageGame,
  onLogin,
}) {
  if (!isAuthenticated) {
    return (
      <section className="empty-state">
        <h1>Entre para ver os jogos</h1>
        <p>Sua conta libera o catalogo da comunidade.</p>
        <button type="button" className="btn btn-primary" onClick={onLogin}>
          Entrar
        </button>
      </section>
    )
  }

  return (
    <section className="games-page">
      <div className="toolbar">
        <div>
          <h1>Jogos</h1>
          <p>Catalogo compartilhado de jogos, notas e opinioes.</p>
        </div>

        <div className="toolbar-actions">
          <label className="search-field" htmlFor="game-search">
            <span>Buscar</span>
            <input
              id="game-search"
              type="text"
              className="form-control"
              placeholder="Titulo, descricao ou genero"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <button type="button" className="btn btn-primary" onClick={onCreateGame}>
            Adicionar jogo
          </button>
        </div>
      </div>

      {loading && <p className="status">Carregando jogos...</p>}

      {!loading && error && <p className="status status-error">{error}</p>}

      {!loading && !error && jogos.length === 0 && (
        <p className="status">Nenhum jogo encontrado.</p>
      )}

      {!loading && !error && jogos.length > 0 && (
        <section className="games-grid" aria-label="Lista de jogos">
          {jogos.map((jogo) => (
            <MovieCard
              key={jogo.id}
              jogo={jogo}
              generoDescricao={generoById[jogo.generoId]}
              imageUrl={getImageUrl(jogo)}
              onOpenDetails={onOpenDetails}
              onEdit={onEditGame}
              onDelete={onDeleteGame}
              isDeleting={deletingGameId === jogo.id}
              canManage={canManageGame(jogo)}
            />
          ))}
        </section>
      )}
    </section>
  )
}

export default MoviesPage
