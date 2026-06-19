import { useState } from 'react'

const emptyForm = {
  titulo: '',
  descricao: '',
  foto: '',
  fotoBinaria: '',
  isUrl: true,
  hasNewFile: false,
  generoId: '',
}

const getInitialFormData = (movie) => {
  if (!movie) {
    return {
      ...emptyForm,
    }
  }

  return {
    titulo: movie.titulo || '',
    descricao: movie.descricao || '',
    foto: movie.foto || '',
    fotoBinaria: '',
    isUrl: Boolean(movie.isUrl),
    hasNewFile: false,
    generoId: movie.generoId ? String(movie.generoId) : '',
  }
}

function EditMovieModal({
  isOpen,
  movie,
  generos,
  onClose,
  onSave,
  isSaving,
  title = 'Atualizar filme',
  submitLabel = 'Salvar alteracoes',
}) {
  if (!isOpen) {
    return null
  }

  return (
    <EditMovieModalContent
      key={movie?.id || 'create'}
      movie={movie}
      generos={generos}
      onClose={onClose}
      onSave={onSave}
      isSaving={isSaving}
      title={title}
      submitLabel={submitLabel}
    />
  )
}

function EditMovieModalContent({
  movie,
  generos,
  onClose,
  onSave,
  isSaving,
  title,
  submitLabel,
}) {
  const [formData, setFormData] = useState(() => getInitialFormData(movie))

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleToggleIsUrl = (event) => {
    const { checked } = event.target
    setFormData((prev) => ({
      ...prev,
      isUrl: checked,
      foto: checked ? prev.foto : '',
      fotoBinaria: checked ? '' : prev.fotoBinaria,
      hasNewFile: checked ? false : prev.hasNewFile,
    }))
  }

  const handleFileChange = (event) => {
    const [file] = event.target.files || []

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        fotoBinaria: '',
        hasNewFile: false,
      }))
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result || ''
      const base64 = typeof result === 'string' && result.includes(',') ? result.split(',')[1] : ''
      setFormData((prev) => ({
        ...prev,
        fotoBinaria: base64,
        hasNewFile: true,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      generoId: Number(formData.generoId),
      isUrl: formData.isUrl,
    }

    if (formData.isUrl) {
      payload.foto = formData.foto?.trim() || null
    } else if (formData.hasNewFile) {
      payload.fotoBinaria = formData.fotoBinaria || null
    }

    onSave(payload)
  }

  return (
    <div className="modal fade show d-block" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-centered" onClick={(event) => event.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title fs-5" id="modal-title">
              {title}
            </h2>
            <button type="button" className="btn-close" aria-label="Fechar" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body d-grid gap-3">
              <div>
                <label className="form-label">Titulo</label>
                <input
                  className="form-control"
                  name="titulo"
                  value={formData.titulo ?? ''}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="form-label">Descricao</label>
                <textarea
                  className="form-control"
                  name="descricao"
                  value={formData.descricao ?? ''}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="d-grid gap-2">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="foto-is-url"
                    checked={formData.isUrl}
                    onChange={handleToggleIsUrl}
                  />
                  <label className="form-check-label" htmlFor="foto-is-url">
                    Usar URL da imagem
                  </label>
                </div>

                {formData.isUrl ? (
                  <div>
                    <label className="form-label">Foto (url ou caminho)</label>
                    <input
                      className="form-control"
                      name="foto"
                      value={formData.foto ?? ''}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="form-label">Foto (arquivo)</label>
                    <input
                      className="form-control"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Genero</label>
                <select
                  className="form-select"
                  name="generoId"
                  value={formData.generoId ?? ''}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione um genero</option>
                  {generos.map((genero) => (
                    <option key={genero.id} value={genero.id}>
                      {genero.descricao}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? 'Salvando...' : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditMovieModal
