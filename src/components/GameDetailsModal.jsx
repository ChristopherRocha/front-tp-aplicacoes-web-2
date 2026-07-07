import { useState } from 'react'

const ratingOptions = [1, 2, 3, 4, 5]

function GameDetailsModal({
  isOpen,
  jogo,
  imageUrl,
  generoDescricao,
  comments,
  commentsLoading,
  commentsError,
  currentUser,
  isSavingComment,
  commentActionId,
  isSavingRating,
  canManageGame,
  canManageComment,
  onClose,
  onEditGame,
  onDeleteGame,
  onSaveRating,
  onDeleteRating,
  onCreateComment,
  onUpdateComment,
  onDeleteComment,
}) {
  const [commentText, setCommentText] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingText, setEditingText] = useState('')

  if (!isOpen || !jogo) {
    return null
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleCreateComment = async (event) => {
    event.preventDefault()

    const texto = commentText.trim()

    if (!texto) {
      return
    }

    await onCreateComment(jogo, texto)
    setCommentText('')
  }

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment.id)
    setEditingText(comment.texto || '')
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingText('')
  }

  const handleUpdateComment = async (event, comment) => {
    event.preventDefault()

    const texto = editingText.trim()

    if (!texto) {
      return
    }

    await onUpdateComment(jogo, comment, texto)
    setEditingCommentId(null)
    setEditingText('')
  }

  const formatDate = (value) => {
    if (!value) {
      return ''
    }

    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  const ratingLabel =
    jogo.avaliacaoMedia === null || jogo.avaliacaoMedia === undefined
      ? 'Sem avaliacoes'
      : `${jogo.avaliacaoMedia.toFixed(1)} / 5`

  return (
    <div
      className="modal fade show d-block game-details-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-details-title"
      onMouseDown={handleBackdropClick}
    >
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content game-details-content">
          <div className="modal-header">
            <div>
              <p className="modal-kicker mb-1">{generoDescricao || 'Sem genero'}</p>
              <h2 className="modal-title" id="game-details-title">
                {jogo.titulo}
              </h2>
            </div>
            <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
          </div>

          <div className="modal-body game-details-body">
            <div className="game-details-media">
              <img src={imageUrl} alt={jogo.titulo} />
            </div>

            <section className="game-details-main" aria-label="Detalhes do jogo">
              <div className="game-details-stats" aria-label="Resumo de avaliacao">
                <div>
                  <span className="stat-value">{ratingLabel}</span>
                  <span className="stat-label">Media</span>
                </div>
                <div>
                  <span className="stat-value">{jogo.avaliacoesCount || 0}</span>
                  <span className="stat-label">Avaliacoes</span>
                </div>
                <div>
                  <span className="stat-value">{jogo.comentariosCount || comments.length || 0}</span>
                  <span className="stat-label">Comentarios</span>
                </div>
              </div>

              <p className="game-details-description">
                {jogo.descricao || 'Este jogo ainda nao possui uma descricao.'}
              </p>

              <div className="game-details-author">
                Adicionado por {jogo.user?.nome || 'utilizador'}.
              </div>

              <div className="rating-panel">
                <div>
                  <h3 className="section-title">Sua avaliacao</h3>
                  <p className="section-subtitle mb-0">
                    {jogo.minhaAvaliacao
                      ? `Voce avaliou com ${jogo.minhaAvaliacao} estrela(s).`
                      : 'Escolha uma nota de 1 a 5.'}
                  </p>
                </div>

                <div className="rating-actions" aria-label="Selecionar nota">
                  {ratingOptions.map((nota) => (
                    <button
                      key={nota}
                      type="button"
                      className={nota <= Number(jogo.minhaAvaliacao || 0) ? 'star-btn active' : 'star-btn'}
                      aria-label={`${nota} estrela${nota > 1 ? 's' : ''}`}
                      aria-pressed={nota === jogo.minhaAvaliacao}
                      disabled={isSavingRating}
                      onClick={() => onSaveRating(jogo, nota)}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-md">
                        <path d="m12 2 2.9 6.2 6.8.8-5 4.7 1.3 6.7-6-3.4-6 3.4 1.3-6.7-5-4.7 6.8-.8L12 2Z" />
                      </svg>
                    </button>
                  ))}
                  {jogo.minhaAvaliacao && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={isSavingRating}
                      onClick={() => onDeleteRating(jogo)}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>

              {canManageGame && (
                <div className="game-owner-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => onEditGame(jogo)}>
                    Editar jogo
                  </button>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => onDeleteGame(jogo)}>
                    Apagar jogo
                  </button>
                </div>
              )}

              <section className="comments-panel" aria-label="Comentarios">
                <div className="d-flex align-items-center justify-content-between gap-3">
                  <h3 className="section-title mb-0">Comentarios e resenhas</h3>
                  {currentUser && <span className="current-user-label">{currentUser.nome}</span>}
                </div>

                <form className="comment-form" onSubmit={handleCreateComment}>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    placeholder="Escreva uma opiniao sobre este jogo"
                    disabled={isSavingComment}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={isSavingComment}>
                    {isSavingComment ? 'Enviando...' : 'Publicar'}
                  </button>
                </form>

                {commentsError && <p className="status status-error">{commentsError}</p>}
                {commentsLoading && <p className="status">Carregando comentarios...</p>}

                {!commentsLoading && comments.length === 0 && (
                  <p className="empty-inline">Nenhum comentario publicado.</p>
                )}

                <div className="comments-list">
                  {comments.map((comment) => {
                    const isEditing = editingCommentId === comment.id
                    const isBusy = commentActionId === comment.id

                    return (
                      <article key={comment.id} className="comment-item">
                        <div className="comment-heading">
                          <div>
                            <strong>{comment.user?.nome || 'Utilizador'}</strong>
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                          {canManageComment(comment) && !isEditing && (
                            <div className="comment-actions">
                              <button
                                type="button"
                                className="icon-button"
                                aria-label="Editar comentario"
                                disabled={isBusy}
                                onClick={() => handleStartEdit(comment)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                                  <path d="M16.65 3.3 20.7 7.35a1 1 0 0 1 0 1.42L9.4 20.08a1 1 0 0 1-.53.28l-4.3.96a1 1 0 0 1-1.2-1.2l.96-4.3a1 1 0 0 1 .28-.53L15.23 3.3a1 1 0 0 1 1.42 0ZM5.7 18.3l2.4-.54 9.13-9.13-1.86-1.86-9.13 9.13-.54 2.4Z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                className="icon-button danger"
                                aria-label="Apagar comentario"
                                disabled={isBusy}
                                onClick={() => onDeleteComment(jogo, comment)}
                              >
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="icon-sm">
                                  <path d="M8 7h8l-.7 12.2a1 1 0 0 1-1 .93H9.7a1 1 0 0 1-1-.93L8 7Zm4-4c1.1 0 2 .9 2 2h4v2H6V5h4c0-1.1.9-2 2-2Zm-2 0h4" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditing ? (
                          <form className="comment-edit-form" onSubmit={(event) => handleUpdateComment(event, comment)}>
                            <textarea
                              className="form-control"
                              rows={3}
                              value={editingText}
                              onChange={(event) => setEditingText(event.target.value)}
                              disabled={isBusy}
                              required
                            />
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm"
                                disabled={isBusy}
                                onClick={handleCancelEdit}
                              >
                                Cancelar
                              </button>
                              <button type="submit" className="btn btn-primary btn-sm" disabled={isBusy}>
                                {isBusy ? 'Salvando...' : 'Salvar'}
                              </button>
                            </div>
                          </form>
                        ) : (
                          <p>{comment.texto}</p>
                        )}
                      </article>
                    )
                  })}
                </div>
              </section>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GameDetailsModal
