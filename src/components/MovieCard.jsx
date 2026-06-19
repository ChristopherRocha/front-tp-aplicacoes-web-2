function MovieCard({
  filme,
  generoDescricao,
  imageUrl,
  onEdit,
  onDelete,
  isDeleting,
  showActions = true,
}) {
  return (
    <article className="card shadow-sm movie-card">
      <img
        className="card-img-top movie-card-image"
        src={imageUrl}
        alt={filme.titulo}
        loading="lazy"
      />

      <div className="card-body d-flex flex-column gap-2 movie-card-body">
        <h3 className="h6 mb-0 movie-card-title">{filme.titulo}</h3>
        <span className="badge text-bg-success align-self-start">
          {generoDescricao || 'Sem genero'}
        </span>
        <p className="text-muted small flex-grow-1 mb-0 movie-card-description">
          {filme.descricao || 'Sem descricao.'}
        </p>

        {showActions && (
          <div className="d-grid gap-2 d-md-flex mt-2">
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onEdit(filme)}>
              Atualizar
            </button>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => onDelete(filme)}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        )}
      </div>
    </article>
  )
}

export default MovieCard
