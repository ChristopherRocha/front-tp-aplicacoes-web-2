function MovieCard({
  jogo,
  generoDescricao,
  imageUrl,
  onOpenDetails,
  onEdit,
  onDelete,
  isDeleting,
  canManage = false,
  showActions = true,
}) {
  const rating =
    jogo.avaliacaoMedia === null || jogo.avaliacaoMedia === undefined
      ? 'Novo'
      : jogo.avaliacaoMedia.toFixed(1)

  return (
    <article className="card shadow-sm game-card">
      <button
        type="button"
        className="game-card-cover"
        onClick={() => onOpenDetails?.(jogo)}
        aria-label={`Abrir detalhes de ${jogo.titulo}`}
      >
        <img src={imageUrl} alt={jogo.titulo} loading="lazy" />
      </button>

      <div className="card-body game-card-body">
        <div className="game-card-topline">
          <span className="badge game-genre-badge">{generoDescricao || 'Sem genero'}</span>
          <span className="game-rating-pill" title="Avaliacao media">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
              <path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.7-6-3.4-6 3.4 1.3-6.7-5-4.7 6.8-.8L12 2Z" />
            </svg>
            {rating}
          </span>
        </div>

        <h3 className="h6 mb-0 game-card-title">{jogo.titulo}</h3>

        <p className="game-card-description">{jogo.descricao || 'Sem descricao.'}</p>

        <div className="game-card-meta" aria-label="Resumo do jogo">
          <span>{jogo.avaliacoesCount || 0} aval.</span>
          <span>{jogo.comentariosCount || 0} coment.</span>
        </div>

        <div className="game-card-actions">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onOpenDetails?.(jogo)}>
            Detalhes
          </button>

          {showActions && canManage && (
            <>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => onEdit(jogo)}>
                Editar
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(jogo)}
                disabled={isDeleting}
              >
                {isDeleting ? 'Apagando...' : 'Apagar'}
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default MovieCard
