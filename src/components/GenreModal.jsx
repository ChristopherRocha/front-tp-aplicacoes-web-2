import { useState } from 'react'

function GenreModal({ isOpen, onClose, onSave, isSaving, genre, title, submitLabel }) {
  if (!isOpen) {
    return null
  }

  return (
    <GenreModalContent
      key={genre?.id || 'create'}
      onClose={onClose}
      onSave={onSave}
      isSaving={isSaving}
      genre={genre}
      title={title}
      submitLabel={submitLabel}
    />
  )
}

function GenreModalContent({ onClose, onSave, isSaving, genre, title, submitLabel }) {
  const [descricao, setDescricao] = useState(() => genre?.descricao || '')

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave({ descricao })
  }

  return (
    <div className="modal fade show d-block" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="genre-modal-title">
              {title || 'Adicionar genero'}
            </h2>
            <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <label className="form-label">Descricao</label>
              <input
                className="form-control"
                type="text"
                value={descricao}
                onChange={(event) => setDescricao(event.target.value)}
                placeholder="Ex.: Acao"
                required
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Salvando...' : submitLabel || 'Adicionar genero'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default GenreModal
