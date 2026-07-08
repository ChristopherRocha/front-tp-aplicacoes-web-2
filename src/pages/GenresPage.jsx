function GenresPage({
  generos,
  loading,
  error,
  isAdmin,
  onCreateGenre,
  onEditGenre,
  onDeleteGenre,
  deletingGenreId,
}) {
  return (
    <section className="genres-page">
      <div className="toolbar">
        <div>
          <h1>Generos</h1>
          <p>Taxonomia usada no catalogo de jogos.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onCreateGenre}>
          Adicionar genero
        </button>
      </div>

      {!isAdmin && (
        <p className="status">
          Sua conta atual pode consultar generos. Criacao, edicao e exclusao sao reservadas a
          administradores.
        </p>
      )}

      {loading && <p className="status">Carregando generos...</p>}

      {!loading && error && <p className="status status-error">{error}</p>}

      {!loading && !error && (
        <section className="genres-grid" aria-label="Lista de generos">
          {generos.length === 0 && <p className="status">Nenhum genero encontrado.</p>}

          {generos.map((genero) => (
            <article key={genero.id} className="genre-card">
              <div>
                <h2>{genero.descricao}</h2>
                <p>{genero.total} jogo(s)</p>
              </div>
              {isAdmin && (
                <div className="genre-actions">
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Editar ${genero.descricao}`}
                    onClick={() => onEditGenre(genero)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                      <path d="M16.65 3.3 20.7 7.35a1 1 0 0 1 0 1.42L9.4 20.08a1 1 0 0 1-.53.28l-4.3.96a1 1 0 0 1-1.2-1.2l.96-4.3a1 1 0 0 1 .28-.53L15.23 3.3a1 1 0 0 1 1.42 0ZM5.7 18.3l2.4-.54 9.13-9.13-1.86-1.86-9.13 9.13-.54 2.4Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="icon-button danger"
                    aria-label={`Apagar ${genero.descricao}`}
                    onClick={() => onDeleteGenre(genero)}
                    disabled={deletingGenreId === genero.id}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                      <path d="M8 7h8l-.7 12.2a1 1 0 0 1-1 .93H9.7a1 1 0 0 1-1-.93L8 7Zm4-4c1.1 0 2 .9 2 2h4v2H6V5h4c0-1.1.9-2 2-2Zm-2 0h4" />
                    </svg>
                  </button>
                </div>
              )}
            </article>
          ))}
        </section>
      )}
    </section>
  )
}

export default GenresPage
