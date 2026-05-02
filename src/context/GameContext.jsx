import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { io } from 'socket.io-client'

const GameContext = createContext(null)

// Connect to the backend server (ensure this matches your server port)
const SOCKET_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'
export const socket = io(SOCKET_URL, {
  autoConnect: false, // We'll connect when needed
})

// Roles
export const ROLES = {
  WEREWOLF: 'werewolf',
  DOKTER: 'dokter',
  DETEKTIF: 'detektif',
  WARGA: 'warga',
}

export const ROLE_INFO = {
  [ROLES.WEREWOLF]: {
    label: 'Serigala',
    color: 'wolf',
    description: 'Pilih satu pemain untuk dimangsa setiap malam.',
    team: 'jahat',
  },
  [ROLES.DOKTER]: {
    label: 'Dokter',
    color: 'dokter',
    description: 'Selamatkan satu pemain dari serangan serigala.',
    team: 'baik',
  },
  [ROLES.DETEKTIF]: {
    label: 'Detektif',
    color: 'detektif',
    description: 'Selidiki identitas satu pemain setiap malam.',
    team: 'baik',
  },
  [ROLES.WARGA]: {
    label: 'Warga Desa',
    color: 'warga',
    description: 'Bertahan hidup dan temukan serigala melalui pemungutan suara.',
    team: 'baik',
  },
}

// Phases
export const PHASES = {
  HOME: 'home',
  LOBBY: 'lobby',
  ROLE_REVEAL: 'role_reveal',
  NIGHT_WEREWOLF: 'night_werewolf',
  NIGHT_DOKTER: 'night_dokter',
  NIGHT_DETEKTIF: 'night_detektif',
  MORNING: 'morning',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  VOTE_TIE: 'vote_tie',
  VOTE_RESULT: 'vote_result',
  GAME_OVER: 'game_over',
}

const initialState = {
  phase: PHASES.HOME,
  roomCode: '',
  players: [],
  currentPlayerId: null,
  hostId: null,
  round: 0,
  roleConfig: null,
  activeRoles: { werewolf: true, dokter: true, detektif: true },
  nightActions: {
    werewolfTarget: null,
    dokterTarget: null,
    detektifTarget: null,
    detektifResult: null,
  },
  lastVictim: null,
  lastSaved: false,
  votes: {},
  tiedCandidateIds: [],
  voteResult: null,
  winner: null,
  gameLog: [],
}

export function GameProvider({ children }) {
  const [state, setState] = useState(initialState)
  const [error, setError] = useState(null)
  const [werewolfHovers, setWerewolfHovers] = useState({}) // { targetId: { hovererId, hovererName } }

  useEffect(() => {
    socket.connect()

    socket.on('state_update', (newState) => {
      setState(newState)
      setError(null)
    })

    socket.on('error', ({ message }) => {
      setError(message)
      setTimeout(() => setError(null), 3000)
    })

    socket.on('kicked', () => {
      sessionStorage.removeItem('redwolf_room')
      sessionStorage.removeItem('redwolf_player')
      window.location.reload()
    })

    // Handle rejoining if browser is refreshed and we still have a session
    const storedRoom = sessionStorage.getItem('redwolf_room')
    const storedPlayer = sessionStorage.getItem('redwolf_player')
    
    if (storedRoom && storedPlayer && state.phase === PHASES.HOME) {
      socket.emit('rejoin_room', { roomCode: storedRoom, playerId: storedPlayer })
    }

    socket.on('room_created', ({ roomCode, playerId }) => {
      sessionStorage.setItem('redwolf_room', roomCode)
      sessionStorage.setItem('redwolf_player', playerId)
    })

    socket.on('room_joined', ({ roomCode, playerId }) => {
      sessionStorage.setItem('redwolf_room', roomCode)
      sessionStorage.setItem('redwolf_player', playerId)
    })

    socket.on('werewolf_hover_update', ({ hovererId, hovererName, targetId }) => {
      setWerewolfHovers(prev => {
        const next = {}
        // Remove any previous hover entry for this hoverer
        Object.entries(prev).forEach(([tId, info]) => {
          if (info.hovererId !== hovererId) next[tId] = info
        })
        // Add new hover
        if (targetId) next[targetId] = { hovererId, hovererName }
        return next
      })
    })

    return () => {
      socket.off('state_update')
      socket.off('error')
      socket.off('room_created')
      socket.off('room_joined')
      socket.off('werewolf_hover_update')
    }
  }, [state.phase])

  const actions = {
    createRoom: useCallback((name) => {
      socket.emit('create_room', { playerName: name })
    }, []),

    joinRoom: useCallback((name, code) => {
      // Allow passing code directly if we update HomePage, else use state roomCode
      // We need to fetch the roomCode from the parameter or fallback to what's in state? 
      // Wait, HomePage manages its own local roomCode state and passes it to actions.joinRoom!
      // Let's ensure joinRoom accepts the code.
      socket.emit('join_room', { roomCode: code, playerName: name })
    }, []),

    addBot: useCallback((name) => {
      socket.emit('add_bot', { roomCode: state.roomCode, requesterId: state.currentPlayerId, botName: name })
    }, [state.roomCode, state.currentPlayerId]),

    kickPlayer: useCallback((targetId) => {
      socket.emit('kick_player', { roomCode: state.roomCode, requesterId: state.currentPlayerId, targetId })
    }, [state.roomCode, state.currentPlayerId]),

    toggleReady: useCallback((playerId) => {
      socket.emit('player_ready', { roomCode: state.roomCode, playerId })
    }, [state.roomCode]),

    startGame: useCallback((roleConfig, timerConfig) => {
      socket.emit('start_game', { roomCode: state.roomCode, requesterId: state.currentPlayerId, roleConfig: roleConfig || null, timerConfig: timerConfig || null })
    }, [state.roomCode, state.currentPlayerId]),

    updateConfig: useCallback((roleConfig, timerConfig) => {
      socket.emit('update_config', { roomCode: state.roomCode, requesterId: state.currentPlayerId, roleConfig, timerConfig })
    }, [state.roomCode, state.currentPlayerId]),

    acknowledgeRole: useCallback(() => {
      socket.emit('acknowledge_role', { roomCode: state.roomCode, playerId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    werewolfAction: useCallback((targetId) => {
      socket.emit('werewolf_action', { roomCode: state.roomCode, requesterId: state.currentPlayerId, targetId })
    }, [state.roomCode, state.currentPlayerId]),

    hoverWerewolfTarget: useCallback((targetId) => {
      socket.emit('werewolf_hover', { roomCode: state.roomCode, requesterId: state.currentPlayerId, targetId })
    }, [state.roomCode, state.currentPlayerId]),

    dokterAction: useCallback((targetId) => {
      socket.emit('dokter_action', { roomCode: state.roomCode, requesterId: state.currentPlayerId, targetId })
    }, [state.roomCode, state.currentPlayerId]),

    detektifAction: useCallback((targetId) => {
      socket.emit('detektif_action', { roomCode: state.roomCode, requesterId: state.currentPlayerId, targetId })
    }, [state.roomCode, state.currentPlayerId]),

    resolveNight: useCallback(() => {
      socket.emit('resolve_night', { roomCode: state.roomCode, requesterId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    endDiscussion: useCallback(() => {
      socket.emit('end_discussion', { roomCode: state.roomCode, requesterId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    castVote: useCallback((voterId, targetId) => {
      socket.emit('cast_vote', { roomCode: state.roomCode, voterId, targetId })
    }, [state.roomCode]),

    resolveVotes: useCallback(() => {
      // In the server version, votes auto-resolve when everyone votes or timer ends.
      // But we can leave this here in case we want to force it.
      socket.emit('resolve_votes', { roomCode: state.roomCode, requesterId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    nextRound: useCallback(() => {
      socket.emit('next_round', { roomCode: state.roomCode, requesterId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    revote: useCallback(() => {
      socket.emit('revote', { roomCode: state.roomCode, requesterId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    resetGame: useCallback(() => {
      socket.emit('reset_game', { roomCode: state.roomCode, requesterId: state.currentPlayerId })
    }, [state.roomCode, state.currentPlayerId]),

    leaveRoom: useCallback(() => {
      socket.emit('leave_room', { roomCode: state.roomCode, playerId: state.currentPlayerId })
      sessionStorage.removeItem('redwolf_room')
      sessionStorage.removeItem('redwolf_player')
      // Delay reload slightly to ensure the socket message is sent before the connection drops
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }, [state.roomCode, state.currentPlayerId]),

    skipNightAction: useCallback(() => {
      // The server auto-skips after timer, but client can still trigger it manually if needed.
    }, []),
  }

  return (
    <GameContext.Provider value={{ state, actions, werewolfHovers }}>
      {error && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--red-primary)', color: 'white', padding: '10px 20px',
          borderRadius: 8, zIndex: 9999, fontWeight: 600, boxShadow: '0 4px 12px rgba(226,75,74,0.4)'
        }}>
          {error}
        </div>
      )}
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
