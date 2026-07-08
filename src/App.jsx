import { useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import Swal from 'sweetalert2'
import './App.css'
import Header from './components/Header'
import EditMovieModal from './components/EditMovieModal'
import GenreModal from './components/GenreModal'
import GameDetailsModal from './components/GameDetailsModal'
import BackGround from './components/BackGround'
import HomePage from './pages/HomePage'
import MoviesPage from './pages/MoviesPage'
import GenresPage from './pages/GenresPage'

const AUTH_STORAGE_KEY = 'gamecritic-auth'
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://back-aplicacoes-web-2.onrender.com')
  .replace(/\/$/, '')

const createApiClient = (token = '') => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
}

const GAME_ENDPOINTS = ['/jogos', '/filmes']

const isNotFound = (requestError) => {
  return axios.isAxiosError(requestError) && requestError.response?.status === 404
}

const requestGameEndpoint = async (buildRequest) => {
  let notFoundError = null

  for (const endpoint of GAME_ENDPOINTS) {
    try {
      return await buildRequest(endpoint)
    } catch (requestError) {
      if (!isNotFound(requestError)) {
        throw requestError
      }

      notFoundError = requestError
    }
  }

  throw notFoundError
}

const requestGameSubresource = async (jogoId, suffix, buildRequest) => {
  return requestGameEndpoint((endpoint) => buildRequest(`${endpoint}/${jogoId}${suffix}`))
}

function App() {
  const [auth, setAuth] = useState(() => {
    try {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
      return storedAuth ? JSON.parse(storedAuth) : null
    } catch {
      return null
    }
  })
  const [jogos, setJogos] = useState([])
  const [generos, setGeneros] = useState([])
  const [loading, setLoading] = useState(Boolean(auth?.token))
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [gameModalMode, setGameModalMode] = useState(null)
  const [selectedGame, setSelectedGame] = useState(null)
  const [isSavingGame, setIsSavingGame] = useState(false)
  const [deletingGameId, setDeletingGameId] = useState(null)
  const [genreModalMode, setGenreModalMode] = useState(null)
  const [selectedGenre, setSelectedGenre] = useState(null)
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
  const [isSavingGenre, setIsSavingGenre] = useState(false)
  const [deletingGenreId, setDeletingGenreId] = useState(null)
  const [detailsGame, setDetailsGame] = useState(null)
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentsError, setCommentsError] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [commentActionId, setCommentActionId] = useState(null)
  const [isSavingRating, setIsSavingRating] = useState(false)
  const authToken = auth?.token || ''
  const currentUser = auth?.user || null
  const isAdmin = currentUser?.role === 'admin'

  const api = useMemo(() => createApiClient(authToken), [authToken])

  const saveAuthSession = (session) => {
    if (!session?.token || !session?.user) {
      return null
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
    setAuth(session)
    return session
  }

  const resetSessionData = () => {
    setJogos([])
    setGeneros([])
    setSearch('')
    setError('')
    setDetailsGame(null)
    setComments([])
    setGameModalMode(null)
    setGenreModalMode(null)
    setIsGenreModalOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuth(null)
    resetSessionData()
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
        <input id="auth-password" class="swal2-input" type="password" placeholder="Senha">
        ${
          isRegister
            ? '<label class="swal2-checkbox"><input id="auth-admin" type="checkbox"><span>Cadastrar como admin</span></label>'
            : ''
        }
      `,
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: isRegister ? 'Criar conta' : 'Entrar',
      denyButtonText: isRegister ? 'Ja tenho conta' : 'Criar conta',
      cancelButtonText: 'Cancelar',
      showLoaderOnConfirm: true,
      allowOutsideClick: () => !Swal.isLoading(),
      allowEscapeKey: () => !Swal.isLoading(),
      preConfirm: async () => {
        const nome = document.getElementById('auth-name')?.value.trim()
        const email = document.getElementById('auth-email')?.value.trim()
        const password = document.getElementById('auth-password')?.value
        const isAdminUser = document.getElementById('auth-admin')?.checked || false

        if (isRegister && !nome) {
          Swal.showValidationMessage('Informe o nome.')
          return false
        }

        if (!email || !password) {
          Swal.showValidationMessage('Informe email e senha.')
          return false
        }

        if (password.length < 6) {
          Swal.showValidationMessage('A senha deve ter pelo menos 6 caracteres.')
          return false
        }

        const payload = isRegister ? { nome, email, password, isAdmin: isAdminUser } : { email, password }

        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/${isRegister ? 'register' : 'login'}`,
            payload,
            { headers: { 'Content-Type': 'application/json' } },
          )

          return {
            token: response.data.token,
            user: response.data.user,
          }
        } catch (authError) {
          Swal.showValidationMessage(getAxiosMessage(authError, 'Nao foi possivel autenticar.'))
          return false
        }
      },
    })

    if (result.isDenied) {
      return handleAuth(isRegister ? 'login' : 'register')
    }

    if (!result.isConfirmed || !result.value) {
      return null
    }

    const session = saveAuthSession(result.value)

    await Swal.fire({
      icon: 'success',
      title: isRegister ? 'Conta criada' : 'Sessao iniciada',
      timer: 1200,
      showConfirmButton: false,
    })

    return session
  }

  const ensureAuthenticated = async () => {
    if (authToken && currentUser) {
      return auth
    }

    return handleAuth('login')
  }

  const getAuthenticatedClient = async () => {
    const session = await ensureAuthenticated()
    return session?.token ? createApiClient(session.token) : null
  }

  const getAdminClient = async () => {
    const session = await ensureAuthenticated()

    if (!session?.token) {
      return null
    }

    if (session.user?.role !== 'admin') {
      await Swal.fire({
        icon: 'warning',
        title: 'Area reservada',
        text: 'A gestao de generos esta disponivel apenas para administradores.',
      })
      return null
    }

    return createApiClient(session.token)
  }

  useEffect(() => {
    if (!authToken) {
      return
    }

    let isActive = true

    api.get('/auth/me')
      .then((response) => {
        if (!isActive) {
          return
        }

        const session = { token: authToken, user: response.data.user }
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
        setAuth(session)
      })
      .catch((authError) => {
        if (!isActive) {
          return
        }

        if (axios.isAxiosError(authError) && authError.response?.status === 401) {
          localStorage.removeItem(AUTH_STORAGE_KEY)
          setAuth(null)
          setJogos([])
          setGeneros([])
          setSearch('')
          setError('')
          setDetailsGame(null)
          setComments([])
          setGameModalMode(null)
          setGenreModalMode(null)
          setIsGenreModalOpen(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [api, authToken])

  useEffect(() => {
    if (!authToken) {
      return
    }

    let isActive = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')

        const [jogosResponse, generosResponse] = await Promise.all([
          requestGameEndpoint((endpoint) => api.get(endpoint)),
          api.get('/generos'),
        ])

        if (!isActive) {
          return
        }

        setJogos(Array.isArray(jogosResponse.data) ? jogosResponse.data : [])
        setGeneros(Array.isArray(generosResponse.data) ? generosResponse.data : [])
      } catch (fetchError) {
        if (!isActive) {
          return
        }

        setError(getAxiosMessage(fetchError, 'Nao foi possivel conectar a API.'))
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isActive = false
    }
  }, [api, authToken])

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

  const getImageUrl = (jogo) => {
    const fallback = 'https://placehold.co/320x420/10131f/e8edf2?text=Sem+Capa'

    if (!jogo) {
      return fallback
    }

    if (jogo.isUrl) {
      return normalizeUrl(jogo.foto) || toDataUrl(jogo.fotoBinaria) || fallback
    }

    return toDataUrl(jogo.fotoBinaria) || normalizeUrl(jogo.foto) || fallback
  }

  const filteredJogos = useMemo(() => {
    const value = search.trim().toLowerCase()

    if (!value) {
      return jogos
    }

    return jogos.filter((jogo) => {
      const titulo = jogo.titulo?.toLowerCase() || ''
      const descricao = jogo.descricao?.toLowerCase() || ''
      const genero = generoById[jogo.generoId]?.toLowerCase() || ''

      return titulo.includes(value) || descricao.includes(value) || genero.includes(value)
    })
  }, [generoById, jogos, search])

  const generosComContagem = useMemo(() => {
    return generos.map((genero) => {
      const total = jogos.filter((jogo) => jogo.generoId === genero.id).length

      return {
        ...genero,
        total,
      }
    })
  }, [jogos, generos])

  const canManageGame = (jogo) => {
    if (!currentUser || !jogo) {
      return false
    }

    return isAdmin || jogo.userId === currentUser.id || jogo.user?.id === currentUser.id
  }

  const canManageComment = (comment) => {
    if (!currentUser || !comment) {
      return false
    }

    return isAdmin || comment.userId === currentUser.id || comment.user?.id === currentUser.id
  }

  const mergeGameIntoState = (updatedGame) => {
    if (!updatedGame?.id) {
      return
    }

    setJogos((prev) => prev.map((jogo) => (jogo.id === updatedGame.id ? updatedGame : jogo)))
    setDetailsGame((prev) => (prev?.id === updatedGame.id ? updatedGame : prev))
  }

  const updateGameCount = (gameId, key, delta) => {
    const updateGame = (jogo) => {
      if (jogo.id !== gameId) {
        return jogo
      }

      return {
        ...jogo,
        [key]: Math.max(0, Number(jogo[key] || 0) + delta),
      }
    }

    setJogos((prev) => prev.map(updateGame))
    setDetailsGame((prev) => (prev?.id === gameId ? updateGame(prev) : prev))
  }

  const handleOpenEditModal = async (jogo) => {
    if (!(await ensureAuthenticated())) {
      return
    }

    setSelectedGame(jogo)
    setGameModalMode('edit')
  }

  const handleOpenCreateGameModal = async () => {
    if (!(await ensureAuthenticated())) {
      return
    }

    setSelectedGame(null)
    setGameModalMode('create')
  }

  const handleCloseEditModal = () => {
    if (isSavingGame) {
      return
    }

    setSelectedGame(null)
    setGameModalMode(null)
  }

  const handleOpenCreateGenreModal = async () => {
    if (!(await getAdminClient())) {
      return
    }

    setSelectedGenre(null)
    setGenreModalMode('create')
    setIsGenreModalOpen(true)
  }

  const handleOpenEditGenreModal = async (genre) => {
    if (!(await getAdminClient())) {
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

  const handleUpdateGame = async (payload) => {
    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    try {
      setIsSavingGame(true)
      setError('')

      let savedGame

      if (gameModalMode === 'create') {
        const response = await requestGameEndpoint((endpoint) => client.post(endpoint, payload))
        savedGame = response.data
        setJogos((prev) => [savedGame, ...prev])
      } else if (selectedGame) {
        const response = await requestGameEndpoint((endpoint) =>
          client.put(`${endpoint}/${selectedGame.id}`, payload),
        )
        savedGame = response.data
        mergeGameIntoState(savedGame)
      }

      setSelectedGame(null)
      setGameModalMode(null)
    } catch (updateError) {
      setError(getAxiosMessage(updateError, 'Erro ao salvar jogo.'))
    } finally {
      setIsSavingGame(false)
    }
  }

  const handleDeleteGame = async (jogo) => {
    if (!jogo) {
      return
    }

    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    const result = await Swal.fire({
      title: 'Confirmar exclusao?',
      text: `Deseja apagar "${jogo.titulo}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setDeletingGameId(jogo.id)
      setError('')

      await requestGameEndpoint((endpoint) => client.delete(`${endpoint}/${jogo.id}`))

      setJogos((prev) => prev.filter((item) => item.id !== jogo.id))
      setDetailsGame((prev) => (prev?.id === jogo.id ? null : prev))
    } catch (deleteError) {
      setError(getAxiosMessage(deleteError, 'Erro ao apagar jogo.'))
    } finally {
      setDeletingGameId(null)
    }
  }

  const handleSaveGenre = async (payload) => {
    const client = await getAdminClient()

    if (!client) {
      return
    }

    try {
      setIsSavingGenre(true)
      setError('')

      if (genreModalMode === 'create') {
        const response = await client.post('/generos', payload)
        const newGenre = response.data
        setGeneros((prev) => [...prev, newGenre])
      } else if (selectedGenre) {
        const response = await client.put(`/generos/${selectedGenre.id}`, payload)
        const updatedGenre = response.data
        setGeneros((prev) =>
          prev.map((item) => (item.id === updatedGenre.id ? updatedGenre : item)),
        )
      }

      setSelectedGenre(null)
      setGenreModalMode(null)
      setIsGenreModalOpen(false)
    } catch (genreError) {
      setError(getAxiosMessage(genreError, 'Erro ao salvar genero.'))
    } finally {
      setIsSavingGenre(false)
    }
  }

  const handleDeleteGenre = async (genre) => {
    if (!genre) {
      return
    }

    const client = await getAdminClient()

    if (!client) {
      return
    }

    const result = await Swal.fire({
      title: 'Confirmar exclusao?',
      text: `Deseja apagar "${genre.descricao}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setDeletingGenreId(genre.id)
      setError('')

      await client.delete(`/generos/${genre.id}`)

      setGeneros((prev) => prev.filter((item) => item.id !== genre.id))
    } catch (deleteError) {
      setError(getAxiosMessage(deleteError, 'Erro ao apagar genero.'))
    } finally {
      setDeletingGenreId(null)
    }
  }

  const loadComments = async (gameId, client = api) => {
    try {
      setCommentsLoading(true)
      setCommentsError('')

      const response = await requestGameSubresource(gameId, '/comentarios', (url) => client.get(url))
      setComments(Array.isArray(response.data) ? response.data : [])
    } catch (commentsRequestError) {
      setCommentsError(getAxiosMessage(commentsRequestError, 'Erro ao carregar comentarios.'))
    } finally {
      setCommentsLoading(false)
    }
  }

  const handleOpenGameDetails = async (jogo) => {
    const session = await ensureAuthenticated()

    if (!session?.token || !jogo) {
      return
    }

    const client = createApiClient(session.token)
    setDetailsGame(jogo)
    setComments([])
    await loadComments(jogo.id, client)
  }

  const handleCloseDetails = () => {
    if (isSavingComment || isSavingRating) {
      return
    }

    setDetailsGame(null)
    setComments([])
    setCommentsError('')
  }

  const handleSaveRating = async (jogo, nota) => {
    if (!jogo) {
      return
    }

    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    try {
      setIsSavingRating(true)
      setCommentsError('')

      const response = await requestGameSubresource(jogo.id, '/avaliacao', (url) =>
        client.put(url, { nota }),
      )
      mergeGameIntoState(response.data)
    } catch (ratingError) {
      setCommentsError(getAxiosMessage(ratingError, 'Erro ao salvar avaliacao.'))
    } finally {
      setIsSavingRating(false)
    }
  }

  const handleDeleteRating = async (jogo) => {
    if (!jogo) {
      return
    }

    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    try {
      setIsSavingRating(true)
      setCommentsError('')

      const response = await requestGameSubresource(jogo.id, '/avaliacao', (url) => client.delete(url))
      mergeGameIntoState(response.data)
    } catch (ratingError) {
      setCommentsError(getAxiosMessage(ratingError, 'Erro ao remover avaliacao.'))
    } finally {
      setIsSavingRating(false)
    }
  }

  const handleCreateComment = async (jogo, texto) => {
    if (!jogo) {
      return
    }

    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    try {
      setIsSavingComment(true)
      setCommentsError('')

      const response = await requestGameSubresource(jogo.id, '/comentarios', (url) =>
        client.post(url, { texto }),
      )
      setComments((prev) => [response.data, ...prev])
      updateGameCount(jogo.id, 'comentariosCount', 1)
    } catch (commentError) {
      setCommentsError(getAxiosMessage(commentError, 'Erro ao criar comentario.'))
    } finally {
      setIsSavingComment(false)
    }
  }

  const handleUpdateComment = async (jogo, comment, texto) => {
    if (!jogo || !comment) {
      return
    }

    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    try {
      setCommentActionId(comment.id)
      setCommentsError('')

      const response = await requestGameSubresource(jogo.id, `/comentarios/${comment.id}`, (url) =>
        client.put(url, { texto }),
      )
      setComments((prev) => prev.map((item) => (item.id === comment.id ? response.data : item)))
    } catch (commentError) {
      setCommentsError(getAxiosMessage(commentError, 'Erro ao atualizar comentario.'))
    } finally {
      setCommentActionId(null)
    }
  }

  const handleDeleteComment = async (jogo, comment) => {
    if (!jogo || !comment) {
      return
    }

    const client = await getAuthenticatedClient()

    if (!client) {
      return
    }

    const result = await Swal.fire({
      title: 'Apagar comentario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, apagar',
      cancelButtonText: 'Cancelar',
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setCommentActionId(comment.id)
      setCommentsError('')

      await requestGameSubresource(jogo.id, `/comentarios/${comment.id}`, (url) => client.delete(url))
      setComments((prev) => prev.filter((item) => item.id !== comment.id))
      updateGameCount(jogo.id, 'comentariosCount', -1)
    } catch (commentError) {
      setCommentsError(getAxiosMessage(commentError, 'Erro ao apagar comentario.'))
    } finally {
      setCommentActionId(null)
    }
  }

  return (
    <>
      <BackGround />
      <Header
        user={currentUser}
        isAdmin={isAdmin}
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
                jogos={jogos}
                generos={generos}
                loading={loading}
                error={error}
                isAuthenticated={Boolean(authToken)}
                generoById={generoById}
                getImageUrl={getImageUrl}
                onOpenDetails={handleOpenGameDetails}
                onLogin={() => handleAuth('login')}
                onRegister={() => handleAuth('register')}
              />
            }
          />
          <Route
            path="/jogos"
            element={
              <MoviesPage
                jogos={filteredJogos}
                loading={loading}
                error={error}
                search={search}
                isAuthenticated={Boolean(authToken)}
                onSearchChange={setSearch}
                generoById={generoById}
                getImageUrl={getImageUrl}
                onCreateGame={handleOpenCreateGameModal}
                onOpenDetails={handleOpenGameDetails}
                onEditGame={handleOpenEditModal}
                onDeleteGame={handleDeleteGame}
                deletingGameId={deletingGameId}
                canManageGame={canManageGame}
                onLogin={() => handleAuth('login')}
              />
            }
          />
          <Route path="/filmes" element={<Navigate to="/jogos" replace />} />
          <Route
            path="/generos"
            element={
              <GenresPage
                generos={generosComContagem}
                loading={loading}
                error={error}
                isAdmin={isAdmin}
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
        isOpen={gameModalMode !== null}
        movie={selectedGame}
        generos={generos}
        onClose={handleCloseEditModal}
        onSave={handleUpdateGame}
        isSaving={isSavingGame}
        title={gameModalMode === 'create' ? 'Adicionar jogo' : 'Atualizar jogo'}
        submitLabel={gameModalMode === 'create' ? 'Adicionar jogo' : 'Salvar alteracoes'}
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

      <GameDetailsModal
        key={detailsGame?.id || 'closed'}
        isOpen={Boolean(detailsGame)}
        jogo={detailsGame}
        imageUrl={getImageUrl(detailsGame)}
        generoDescricao={detailsGame ? generoById[detailsGame.generoId] : ''}
        comments={comments}
        commentsLoading={commentsLoading}
        commentsError={commentsError}
        currentUser={currentUser}
        isSavingComment={isSavingComment}
        commentActionId={commentActionId}
        isSavingRating={isSavingRating}
        canManageGame={detailsGame ? canManageGame(detailsGame) : false}
        canManageComment={canManageComment}
        onClose={handleCloseDetails}
        onEditGame={handleOpenEditModal}
        onDeleteGame={handleDeleteGame}
        onSaveRating={handleSaveRating}
        onDeleteRating={handleDeleteRating}
        onCreateComment={handleCreateComment}
        onUpdateComment={handleUpdateComment}
        onDeleteComment={handleDeleteComment}
      />
    </>
  )
}

export default App
