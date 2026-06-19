import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import './App.css'
import Header from './components/Header'
import EditMovieModal from './components/EditMovieModal'
import GenreModal from './components/GenreModal'
import BackGround from './components/BackGround'
import HomePage from './pages/HomePage'
import MoviesPage from './pages/MoviesPage'
import GenresPage from './pages/GenresPage'

const AUTH_STORAGE_KEY = 'movie-rar-auth'
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://back-aplicacoes-web-2.onrender.com')
  .replace(/\/$/, '')

function App() {
  const [auth, setAuth] = useState(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
      return storedAuth ? JSON.parse(storedAuth) : null
    } catch {
      return null
    }
  })
  const [filmes, setFilmes] = useState([])
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [movieModalMode, setMovieModalMode] = useState(null)
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [isSavingMovie, setIsSavingMovie] = useState(false)
  const [deletingMovieId, setDeletingMovieId] = useState(null)
  const [genreModalMode, setGenreModalMode] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [isSavingGenre, setIsSavingGenre] = useState(false)
  const [deletingGenreId, setDeletingGenreId] = useState(null)
  const authToken = auth?.token || ''

  const api = useMemo(() => {
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
    })
  }, [authToken])

  const saveAuthSession = (session) => {
    if (!session?.token || !session?.user) {
      return
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    setAuth(session)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
  }

  const getAxiosMessage = (requestError, fallback) => {
    if (axios.isAxiosError(requestError)) {
      return requestError.response?.data?.error || requestError.message || fallback
    }

    return requestError.message || fallback
  }

  const handleAuth = async (mode = 'login') => {
    const isRegister = mode === 'register'
    const result = await Swal.fire({
      title: isRegister ? 'Criar conta' : 'Entrar',
      html: `
        ${isRegister ? '<input id="auth-name" class="swal2-input" placeholder="Nome">' : ''}
        <input id="auth-email" class="swal2-input" type="email" placeholder="Email">
        <input id="auth-password" class="swal2-input" type="password" placeholder="Password">
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: isRegister ? 'Criar conta' : 'Entrar',
      denyButtonText: isRegister ? 'Ja tenho conta' : 'Criar conta',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nome = document.getElementById('auth-name')?.value.trim()
        const email = document.getElementById('auth-email')?.value.trim()
        const password = document.getElementById('auth-password')?.value

        if (isRegister && !nome) {
          Swal.showValidationMessage('Informe o nome.')
          return false
        }

        if (!email || !password) {
          Swal.showValidationMessage('Informe email e password.')
          return false
        }

        return isRegister ? { nome, email, password } : { email, password }
      },
    })

    if (result.isDenied) {
      return handleAuth(isRegister ? 'login' : 'register')
    }

    if (!result.isConfirmed || !result.value) {
      return null
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`,
        result.value,
        { headers: { 'Content-Type': 'application/json' } },
      )
      const session = {
        token: response.data.token,
        user: response.data.user,
      }

      saveAuthSession(session)
      await Swal.fire({
        icon: 'success',
        title: isRegister ? 'Conta criada' : 'Sessao iniciada',
        timer: 1400,
        showConfirmButton: false,
      })

      return session
    } catch (authError) {
      await Swal.fire({
        icon: 'error',
        title: 'Falha na autenticacao',
        text: getAxiosMessage(authError, 'Nao foi possivel autenticar.'),
      })
      return null
    }
  }

  const ensureAuthenticated = async () => {
    if (authToken) {
      return true
    }

    const session = await handleAuth('login')
    return Boolean(session?.token)
  }

  useEffect(() => {
    if (!authToken) {
      return
    }

    api.get('/auth/me')
      .then((response) => {
        saveAuthSession({ token: authToken, user: response.data.user })
      })
      .catch((authError) => {
        if (axios.isAxiosError(authError) && authError.response?.status === 401) {
          handleLogout()
        }
      })
  }, [api, authToken])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [filmesResponse, generosResponse] = await Promise.all([
          api.get('/filmes'),
          api.get('/generos'),
        ])

        setFilmes(Array.isArray(filmesResponse.data) ? filmesResponse.data : [])
        setGeneros(Array.isArray(generosResponse.data) ? generosResponse.data : [])
      } catch (fetchError) {
        if (axios.isAxiosError(fetchError)) {
          setError(
            fetchError.response?.data?.error ||
              fetchError.message ||
              'Nao foi possivel conectar a API.',
          )
        } else {
          setError(fetchError.message || 'Nao foi possivel conectar a API.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [api])

  const generoById = useMemo(() => {
    return generos.reduce((acc, genero) => {
      acc[genero.id] = genero.descricao
      return acc
    }, {})
  }, [generos])

  const normalizeUrl = (foto) => {
    if (!foto) {
      return null
    }

    if (foto.startsWith('http://') || foto.startsWith('https://')) {
      return foto
    }

    if (foto.startsWith('/')) {
      return `${API_BASE_URL}${foto}`
    }

    return `${API_BASE_URL}/${foto}`
  }

  const bytesToBase64 = (bytes) => {
    if (!bytes || bytes.length === 0) {
      return ''
    }

    let binary = ''
    const chunkSize = 8192

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }

    return btoa(binary)
  }

  const bytesToString = (bytes) => {
    if (!bytes || bytes.length === 0) {
      return ''
    }

    let text = ''
    const chunkSize = 8192

    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.slice(i, i + chunkSize)
      text += String.fromCharCode(...chunk)
    }

    return text
  }

  const looksLikeBase64 = (value) => {
    if (!value || typeof value !== 'string') {
      return false
    }

    const trimmed = value.trim()

    if (trimmed.length < 24 || trimmed.length % 4 !== 0) {
      return false
    }

    return /^[A-Za-z0-9+/=\r\n]+$/.test(trimmed)
  }

  const normalizeBase64 = (value) => {
    if (!value) {
      return ''
    }

    if (typeof value === 'string') {
      return value
    }

    if (value?.type === 'Buffer' && Array.isArray(value.data)) {
      const asText = bytesToString(value.data)
      return looksLikeBase64(asText) ? asText.trim() : bytesToBase64(value.data)
    }

    if (Array.isArray(value)) {
      const asText = bytesToString(value)
      return looksLikeBase64(asText) ? asText.trim() : bytesToBase64(value)
    }

    if (value instanceof ArrayBuffer) {
      return bytesToBase64(Array.from(new Uint8Array(value)))
    }

    if (ArrayBuffer.isView(value)) {
      return bytesToBase64(Array.from(new Uint8Array(value.buffer)))
    }

    return ''
  }

  const toDataUrl = (base64) => {
    const normalized = normalizeBase64(base64)

    if (!normalized) {
      return null
    }

    if (typeof normalized === 'string' && normalized.startsWith('data:image')) {
      return normalized
    }

    return `data:image/*;base64,${normalized}`
  }

  const getImageUrl = (filme) => {
    const fallback = 'https://placehold.co/250x280?text=Sem+Imagem'

    if (!filme) {
      return fallback
    }

    if (filme.isUrl) {
      return normalizeUrl(filme.foto) || toDataUrl(filme.fotoBinaria) || fallback
    }

    return toDataUrl(filme.fotoBinaria) || normalizeUrl(filme.foto) || fallback
  }

  const filteredFilmes = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) {
      return filmes
    }

    return filmes.filter((filme) => filme.titulo?.toLowerCase().includes(value))
  }, [filmes, search])

  const generosComContagem = useMemo(() => {
    return generos.map((genero) => {
      const total = filmes.filter((filme) => filme.generoId === genero.id).length

      return {
        ...genero,
        total,
      }
    })
  }, [filmes, generos])

  const handleOpenEditModal = async (movie) => {
    if (!(await ensureAuthenticated())) {
      return
    }

    setSelectedMovie(movie)
    setMovieModalMode('edit')
  }

  const handleOpenCreateMovieModal = async () => {
    if (!(await ensureAuthenticated())) {
      return
    }

    setSelectedMovie(null)
    setMovieModalMode('create')
  }

  const handleCloseEditModal = () => {
    if (isSavingMovie) {
      return
    }

    setSelectedMovie(null)
    setMovieModalMode(null)
  }

  const handleOpenCreateGenreModal = async () => {
    if (!(await ensureAuthenticated())) {
      return
    }

    setSelectedGenre(null)
    setGenreModalMode('create')
    setIsGenreModalOpen(true)
  }

  const handleOpenEditGenreModal = async (genre) => {
    if (!(await ensureAuthenticated())) {
      return
    }

    setSelectedGenre(genre)
    setGenreModalMode('edit')
    setIsGenreModalOpen(true)
  }

  const handleCloseGenreModal = () => {
    if (isSavingGenre) {
      return
    }

    setSelectedGenre(null)
    setGenreModalMode(null)
    setIsGenreModalOpen(false)
  }

  const handleUpdateMovie = async (payload) => {
    if (!(await ensureAuthenticated())) {
      return
    }

    try {
      setIsSavingMovie(true)
      setError('')

      let savedMovie

      if (movieModalMode === 'create') {
        const response = await api.post('/filmes', payload)
        savedMovie = response.data
        setFilmes((prev) => [savedMovie, ...prev])
      } else if (selectedMovie) {
        const response = await api.put(`/filmes/${selectedMovie.id}`, payload)
        savedMovie = response.data
        setFilmes((prev) =>
          prev.map((movie) => (movie.id === savedMovie.id ? savedMovie : movie)),
        )
      }

      setSelectedMovie(null)
      setMovieModalMode(null)
    } catch (updateError) {
      if (axios.isAxiosError(updateError)) {
        setError(
          updateError.response?.data?.error ||
            updateError.message ||
            'Erro ao atualizar filme.',
        )
      } else {
        setError(updateError.message || 'Erro ao atualizar filme.')
      }
    } finally {
      setIsSavingMovie(false)
    }
  }

  const handleDeleteMovie = async (movie) => {
    if (!movie) {
      return
    }

    if (!(await ensureAuthenticated())) {
      return
    }

    const result = await Swal.fire({
      title: 'Confirmar exclusao?',
      text: `Deseja deletar "${movie.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setDeletingMovieId(movie.id)
      setError('')

      await api.delete(`/filmes/${movie.id}`)

      setFilmes((prev) => prev.filter((item) => item.id !== movie.id))
    } catch (deleteError) {
      if (axios.isAxiosError(deleteError)) {
        setError(
          deleteError.response?.data?.error ||
            deleteError.message ||
            'Erro ao deletar filme.',
        )
      } else {
        setError(deleteError.message || 'Erro ao deletar filme.')
      }
    } finally {
      setDeletingMovieId(null)
    }
  }

  const handleSaveGenre = async (payload) => {
    if (!(await ensureAuthenticated())) {
      return
    }

    try {
      setIsSavingGenre(true)
      setError('')

      if (genreModalMode === 'create') {
        const response = await api.post('/generos', payload)
        const newGenre = response.data
        setGeneros((prev) => [...prev, newGenre])
      } else if (selectedGenre) {
        const response = await api.put(`/generos/${selectedGenre.id}`, payload)
        const updatedGenre = response.data
        setGeneros((prev) =>
          prev.map((item) => (item.id === updatedGenre.id ? updatedGenre : item)),
        )
      }

      setSelectedGenre(null)
      setGenreModalMode(null)
      setIsGenreModalOpen(false)
    } catch (genreError) {
      if (axios.isAxiosError(genreError)) {
        setError(
          genreError.response?.data?.error ||
            genreError.message ||
            'Erro ao salvar genero.',
        )
      } else {
        setError(genreError.message || 'Erro ao salvar genero.')
      }
    } finally {
      setIsSavingGenre(false)
    }
  }

  const handleDeleteGenre = async (genre) => {
    if (!genre) {
      return
    }

    if (!(await ensureAuthenticated())) {
      return
    }

    const result = await Swal.fire({
      title: 'Confirmar exclusao?',
      text: `Deseja deletar "${genre.descricao}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setDeletingGenreId(genre.id)
      setError('')

      await api.delete(`/generos/${genre.id}`)

      setGeneros((prev) => prev.filter((item) => item.id !== genre.id))
    } catch (deleteError) {
      if (axios.isAxiosError(deleteError)) {
        setError(
          deleteError.response?.data?.error ||
            deleteError.message ||
            'Erro ao deletar genero.',
        )
      } else {
        setError(deleteError.message || 'Erro ao deletar genero.')
      }
    } finally {
      setDeletingGenreId(null)
    }
  }

  return (
    <>
      <BackGround />
      <Header
        user={auth?.user}
        onLogin={() => handleAuth('login')}
        onRegister={() => handleAuth('register')}
        onLogout={handleLogout}
      />

      <main className="app-page container-xxl">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                filmes={filmes}
                generos={generos}
                loading={loading}
                error={error}
                generoById={generoById}
                getImageUrl={getImageUrl}
              />
            }
          />
          <Route
            path="/filmes"
            element={
              <MoviesPage
                filmes={filteredFilmes}
                loading={loading}
                error={error}
                search={search}
                onSearchChange={setSearch}
                generoById={generoById}
                getImageUrl={getImageUrl}
                onCreateMovie={handleOpenCreateMovieModal}
                onEditMovie={handleOpenEditModal}
                onDeleteMovie={handleDeleteMovie}
                deletingMovieId={deletingMovieId}
              />
            }
          />
          <Route
            path="/generos"
            element={
              <GenresPage
                generos={generosComContagem}
                loading={loading}
                error={error}
                onCreateGenre={handleOpenCreateGenreModal}
                onEditGenre={handleOpenEditGenreModal}
                onDeleteGenre={handleDeleteGenre}
                deletingGenreId={deletingGenreId}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <EditMovieModal
        isOpen={movieModalMode !== null}
        movie={selectedMovie}
        generos={generos}
        onClose={handleCloseEditModal}
        onSave={handleUpdateMovie}
        isSaving={isSavingMovie}
        title={movieModalMode === 'create' ? 'Adicionar filme' : 'Atualizar filme'}
        submitLabel={movieModalMode === 'create' ? 'Adicionar filme' : 'Salvar alteracoes'}
      />

      <GenreModal
        isOpen={isGenreModalOpen}
        onClose={handleCloseGenreModal}
        onSave={handleSaveGenre}
        isSaving={isSavingGenre}
        genre={selectedGenre}
        title={genreModalMode === 'edit' ? 'Editar genero' : 'Adicionar genero'}
        submitLabel={genreModalMode === 'edit' ? 'Salvar alteracoes' : 'Adicionar genero'}
      />
    </>
  )
}

export default App
