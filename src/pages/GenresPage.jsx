function GenresPage({
  generos,
  loading,
  error,
  onCreateGenre,
  onEditGenre,
  onDeleteGenre,
  deletingGenreId,
}) {
  return (
    <section className="d-grid gap-3">
      <div className="d-flex justify-content-between align-items-center">
        <button type="button" className="btn btn-success" onClick={onCreateGenre}>
          Adicionar genero
        </button>
      </div>

      {loading && <p className="status">Carregando generos...</p>}

      {!loading && error && <p className="status status-error">{error}</p>}

      {!loading && !error && (
        <section className="genres-grid" aria-label="Lista de generos">
          {generos.length === 0 && <p className="status">Nenhum genero encontrado.</p>}

          {generos.map((genero) => (
            <div key={genero.id} className="genre-cell">
              <article className="card shadow-sm h-100">
                <div className="card-body d-flex justify-content-between gap-2">
                  <div>
                    <h2 className="h6 mb-1">{genero.descricao}</h2>
                    <p className="text-muted small mb-0">{genero.total} filme(s)</p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm genre-edit-btn"
                      aria-label={`Editar ${genero.descricao}`}
                      onClick={() => onEditGenre(genero)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                        <path d="M16.65 3.3 20.7 7.35a1 1 0 0 1 0 1.42L9.4 20.08a1 1 0 0 1-.53.28l-4.3.96a1 1 0 0 1-1.2-1.2l.96-4.3a1 1 0 0 1 .28-.53L15.23 3.3a1 1 0 0 1 1.42 0ZM5.7 18.3l2.4-.54 9.13-9.13-1.86-1.86-9.13 9.13-.54 2.4Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      aria-label={`Deletar ${genero.descricao}`}
                      onClick={() => onDeleteGenre(genero)}
                      disabled={deletingGenreId === genero.id}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                        <path d="M8 7h8l-.7 12.2a1 1 0 0 1-1 .93H9.7a1 1 0 0 1-1-.93L8 7Zm4-4c1.1 0 2 .9 2 2h4v2H6V5h4c0-1.1.9-2 2-2Zm-2 0h4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </section>
      )}
    </section>
  )
}

export default GenresPage
