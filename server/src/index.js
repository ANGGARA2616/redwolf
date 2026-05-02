/**
 * index.js
 * Redwolf Online — Express + Socket.io Server
 * 
 * Event flow:
 *  Client → Server: action events  (create_room, join_room, player_ready, ...)
 *  Server → Client: state_update   (personalized per-player view of game state)
 *  Server → Client: error          (validation failures)
 */

const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')

const gl = require('./gameLogic')
const rm = require('./roomManager')

// ─── App Setup ────────────────────────────────────────────────────────────

const app    = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
  pingTimeout:  60000,
  pingInterval: 25000,
})

app.use(cors())
app.use(express.json())

// ─── REST: Health check ───────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', rooms: rm.listRooms() })
})

// ─── Helpers ─────────────────────────────────────────────────────────────

/**
 * Broadcast a personalized state_update to every player in a room.
 * Each socket receives only the data they are allowed to see.
 */
function broadcastState(roomCode) {
  const room = rm.getRoom(roomCode)
  if (!room?.state) return

  const { state } = room
  state.players.forEach(player => {
    if (!player.socketId) return   // bot or disconnected
    const view = gl.buildPlayerView(state, player.id)
    io.to(player.socketId).emit('state_update', view)
  })
}

function emitError(socket, message) {
  socket.emit('error', { message })
}

/** Cancel a pending night-phase auto-skip timer */
function clearNightTimer(room, phase) {
  const t = room.nightTimers.get(phase)
  if (t) { clearTimeout(t); room.nightTimers.delete(phase) }
}

/** Schedule an auto-skip for a night sub-phase */
function scheduleNightAutoSkip(roomCode, phase) {
  const room = rm.getRoom(roomCode)
  if (!room) return
  clearNightTimer(room, phase)

  let delayMs = 20_000
  const cfg = room.state?.timerConfig
  if (cfg) {
    if (phase === gl.PHASES.NIGHT_WEREWOLF) delayMs = (cfg.werewolf || 30) * 1000
    if (phase === gl.PHASES.NIGHT_DOKTER) delayMs = (cfg.dokter || 7) * 1000
    if (phase === gl.PHASES.NIGHT_DETEKTIF) delayMs = (cfg.detektif || 6) * 1000
  }

  const timer = setTimeout(() => {
    const r2 = rm.getRoom(roomCode)
    if (!r2 || r2.state?.phase !== phase) return
    r2.state = gl.skipNightAction(r2.state)
    rm.setRoomState(roomCode, r2.state)
    broadcastState(roomCode)

    // Chain to next night phase auto-skip if needed
    if (r2.state.phase === gl.PHASES.NIGHT_DOKTER)   scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_DOKTER)
    if (r2.state.phase === gl.PHASES.NIGHT_DETEKTIF) scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_DETEKTIF)
    if (r2.state.phase === gl.PHASES.MORNING)        clearAllNightTimers(r2)
  }, delayMs)

  room.nightTimers.set(phase, timer)
}

function clearAllNightTimers(room) {
  room.nightTimers.forEach(t => clearTimeout(t))
  room.nightTimers.clear()
}

/** Auto-close voting */
function scheduleVoteAutoClose(roomCode) {
  const room = rm.getRoom(roomCode)
  if (!room) return
  clearNightTimer(room, 'voting')

  const delayMs = (room.state?.timerConfig?.voting || 30) * 1000

  const timer = setTimeout(() => {
    const r2 = rm.getRoom(roomCode)
    if (!r2 || r2.state?.phase !== gl.PHASES.VOTING) return

    // Auto-vote random target for anyone who hasn't voted yet
    const alivePlayers = r2.state.players.filter(p => p.isAlive)
    r2.state.players.forEach(p => {
      if (p.isAlive && !r2.state.votes[p.id]) {
        const targets = alivePlayers.filter(t => t.id !== p.id)
        const target  = targets[Math.floor(Math.random() * targets.length)]
        if (target) r2.state = gl.castVote(r2.state, { voterId: p.id, targetId: target.id })
      }
    })

    r2.state = gl.resolveVotes(r2.state)
    rm.setRoomState(roomCode, r2.state)
    broadcastState(roomCode)
  }, delayMs)

  room.nightTimers.set('voting', timer)
}

// ─── Socket.io Connection ─────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`[+] Socket connected: ${socket.id}`)

  // ── CREATE ROOM ──────────────────────────────────────────────────────
  socket.on('create_room', ({ playerName }) => {
    if (!playerName?.trim()) return emitError(socket, 'Nama pemain tidak boleh kosong.')

    const playerId = 'player-' + Date.now()
    const roomCode = rm.createRoom(playerId)

    let state = gl.createGameState(roomCode, playerId)
    state = gl.addPlayer(state, { playerId, name: playerName.trim(), socketId: socket.id, isHost: true })
    rm.setRoomState(roomCode, state)

    // Start cleanup timer (reset on activity)
    rm.scheduleRoomCleanup(roomCode)

    socket.join(roomCode)
    socket.emit('room_created', { roomCode, playerId })
    broadcastState(roomCode)
    console.log(`[Room] ${roomCode} created by "${playerName}" (${playerId})`)
  })

  // ── JOIN ROOM ─────────────────────────────────────────────────────────
  socket.on('join_room', ({ roomCode, playerName }) => {
    const code = roomCode?.trim().toUpperCase()
    if (!playerName?.trim()) return emitError(socket, 'Nama pemain tidak boleh kosong.')
    if (!rm.roomExists(code))  return emitError(socket, `Room "${code}" tidak ditemukan.`)

    const room = rm.getRoom(code)
    if (!room.state)            return emitError(socket, 'Room tidak valid.')
    if (room.state.phase !== gl.PHASES.LOBBY) return emitError(socket, 'Game sudah dimulai.')
    const existingPlayer = room.state.players.find(p => p.name.toLowerCase() === playerName.trim().toLowerCase())
    if (existingPlayer) {
      // Allow taking over the slot if the previous connection is dead
      const isConnected = io.sockets.sockets.has(existingPlayer.socketId)
      if (isConnected) {
        return emitError(socket, 'Nama sudah dipakai oleh pemain yang sedang aktif.')
      } else {
        // Treat as a rejoin
        room.state = gl.updateSocketId(room.state, { playerId: existingPlayer.id, socketId: socket.id })
        rm.setRoomState(code, room.state)
        socket.join(code)
        socket.emit('room_joined', { roomCode: code, playerId: existingPlayer.id })
        broadcastState(code)
        console.log(`[Room] "${playerName}" hijacked/re-joined ${code} via Gabung`)
        return
      }
    }

    if (room.state.players.length >= 15) return emitError(socket, 'Room sudah penuh (maks. 15 pemain).')

    const playerId = 'player-' + Date.now()
    room.state = gl.addPlayer(room.state, { playerId, name: playerName.trim(), socketId: socket.id, isHost: false })
    rm.setRoomState(code, room.state)

    socket.join(code)
    socket.emit('room_joined', { roomCode: code, playerId })
    broadcastState(code)
    console.log(`[Room] "${playerName}" joined ${code}`)
  })

  // ── REJOIN (reconnect with existing playerId) ─────────────────────────
  socket.on('rejoin_room', ({ roomCode, playerId }) => {
    const code = roomCode?.trim().toUpperCase()
    const room = rm.getRoom(code)
    if (!room?.state) return emitError(socket, 'Room tidak ditemukan atau sudah berakhir.')

    const player = room.state.players.find(p => p.id === playerId)
    if (!player) return emitError(socket, 'Pemain tidak ditemukan di room ini.')

    room.state = gl.updateSocketId(room.state, { playerId, socketId: socket.id })
    rm.setRoomState(code, room.state)

    socket.join(code)
    socket.emit('room_joined', { roomCode: code, playerId })
    broadcastState(code)
    console.log(`[Room] "${player.name}" re-joined ${code}`)
  })

  // ── ADD BOT ───────────────────────────────────────────────────────────
  socket.on('add_bot', ({ roomCode, requesterId, botName }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return emitError(socket, 'Room tidak ditemukan.')
    if (requesterId !== room.state.hostId) return emitError(socket, 'Hanya host yang dapat menambah bot.')

    room.state = gl.addBot(room.state, { name: botName })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
  })

  // ── UPDATE CONFIG ─────────────────────────────────────────────────────
  socket.on('update_config', ({ roomCode, requesterId, roleConfig, timerConfig }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return
    if (requesterId !== room.state.hostId) return emitError(socket, 'Hanya host yang dapat mengubah pengaturan.')

    room.state = gl.updateConfig(room.state, { roleConfig, timerConfig })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
  })

  // ── TOGGLE READY ──────────────────────────────────────────────────────
  socket.on('player_ready', ({ roomCode, playerId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.toggleReady(room.state, { playerId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
  })

  // ── START GAME ────────────────────────────────────────────────────────
  socket.on('start_game', ({ roomCode, requesterId, roleConfig, timerConfig }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    if (timerConfig) {
      room.state = gl.updateConfig(room.state, { roleConfig: roleConfig || null, timerConfig })
    }

    const result = gl.startGame(room.state, { requesterId, roleConfig: roleConfig || null })
    if (result.error) return emitError(socket, result.error)

    rm.setRoomState(roomCode, result.state)
    broadcastState(roomCode)
    console.log(`[Room] ${roomCode} game started — ${result.state.players.length} players, activeRoles:`, result.state.activeRoles)
  })

  // ── ACKNOWLEDGE ROLE ──────────────────────────────────────────────────
  socket.on('acknowledge_role', ({ roomCode, playerId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.acknowledgeRole(room.state, { playerId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)

    // If we just entered night phase, start night timers
    if (room.state.phase === gl.PHASES.NIGHT_WEREWOLF) {
      scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_WEREWOLF)
    }
  })

  // ── NIGHT ACTIONS ─────────────────────────────────────────────────────
  socket.on('werewolf_action', ({ roomCode, requesterId, targetId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    clearNightTimer(room, gl.PHASES.NIGHT_WEREWOLF)
    room.state = gl.werewolfAction(room.state, { requesterId, targetId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)

    // Schedule auto-skip for the next active night phase
    if (room.state.phase === gl.PHASES.NIGHT_DOKTER) {
      scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_DOKTER)
    } else if (room.state.phase === gl.PHASES.NIGHT_DETEKTIF) {
      scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_DETEKTIF)
    } else if (room.state.phase === gl.PHASES.MORNING) {
      clearAllNightTimers(room)
    }
  })

  // ── WEREWOLF HOVER (real-time selection preview for co-wolves) ────────
  socket.on('werewolf_hover', ({ roomCode, requesterId, targetId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    // Only broadcast to other werewolves in the room
    const requester = room.state.players.find(p => p.id === requesterId)
    if (requester?.role !== 'werewolf') return

    room.state.players.forEach(p => {
      if (p.id !== requesterId && p.role === 'werewolf' && p.socketId) {
        io.to(p.socketId).emit('werewolf_hover_update', {
          hovererId: requesterId,
          hovererName: requester.name,
          targetId,
        })
      }
    })
  })

  socket.on('dokter_action', ({ roomCode, requesterId, targetId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    clearNightTimer(room, gl.PHASES.NIGHT_DOKTER)
    room.state = gl.dokterAction(room.state, { requesterId, targetId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)

    if (room.state.phase === gl.PHASES.NIGHT_DETEKTIF) {
      scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_DETEKTIF)
    } else {
      clearAllNightTimers(room)
    }
  })

  socket.on('detektif_action', ({ roomCode, requesterId, targetId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    clearNightTimer(room, gl.PHASES.NIGHT_DETEKTIF)
    room.state = gl.detektifAction(room.state, { requesterId, targetId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
    clearAllNightTimers(room)
  })

  // ── RESOLVE NIGHT → DISCUSSION ────────────────────────────────────────
  socket.on('resolve_night', ({ roomCode, requesterId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.resolveNight(room.state, { requesterId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
  })

  // ── END DISCUSSION → VOTING ───────────────────────────────────────────
  socket.on('end_discussion', ({ roomCode, requesterId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.endDiscussion(room.state, { requesterId })
    rm.setRoomState(roomCode, room.state)

    // Auto-cast votes for bots immediately
    if (room.state.phase === gl.PHASES.VOTING) {
      const bots = room.state.players.filter(p => p.isBot && p.isAlive)
      const aliveTargets = room.state.players.filter(p => p.isAlive)
      
      bots.forEach(bot => {
        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)]
        if (target) {
          room.state = gl.castVote(room.state, { voterId: bot.id, targetId: target.id })
        }
      })
      rm.setRoomState(roomCode, room.state)
      
      // Start vote auto-close timer
      scheduleVoteAutoClose(roomCode)
    }

    broadcastState(roomCode)
  })

  // ── CAST VOTE ─────────────────────────────────────────────────────────
  socket.on('cast_vote', ({ roomCode, voterId, targetId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.castVote(room.state, { voterId, targetId })
    rm.setRoomState(roomCode, room.state)

    // Check if ALL alive players have voted → resolve immediately
    const alivePlayers = room.state.players.filter(p => p.isAlive)
    const allVoted     = alivePlayers.every(p => room.state.votes[p.id])
    if (allVoted) {
      clearNightTimer(room, 'voting')
      room.state = gl.resolveVotes(room.state)
      rm.setRoomState(roomCode, room.state)
    }

    broadcastState(roomCode)
  })

  // ── NEXT ROUND ────────────────────────────────────────────────────────
  socket.on('next_round', ({ roomCode, requesterId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.nextRound(room.state, { requesterId })
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)

    // Restart night timers for new round
    if (room.state.phase === gl.PHASES.NIGHT_WEREWOLF) {
      scheduleNightAutoSkip(roomCode, gl.PHASES.NIGHT_WEREWOLF)
    }
  })

  // ── REVOTE ────────────────────────────────────────────────────────────
  socket.on('revote', ({ roomCode, requesterId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    room.state = gl.revote(room.state, { requesterId })
    rm.setRoomState(roomCode, room.state)

    // Auto-cast votes for bots immediately
    if (room.state.phase === gl.PHASES.VOTING) {
      const bots = room.state.players.filter(p => p.isBot && p.isAlive)
      const aliveTargets = room.state.players.filter(p => p.isAlive)
      
      bots.forEach(bot => {
        const target = aliveTargets[Math.floor(Math.random() * aliveTargets.length)]
        if (target) {
          room.state = gl.castVote(room.state, { voterId: bot.id, targetId: target.id })
        }
      })
      rm.setRoomState(roomCode, room.state)
      scheduleVoteAutoClose(roomCode)
    }

    broadcastState(roomCode)
  })

  // ── RESET GAME (REMATCH) ──────────────────────────────────────────────
  socket.on('reset_game', ({ roomCode, requesterId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return
    if (requesterId !== room.state.hostId) return emitError(socket, 'Hanya host yang bisa mereset game.')

    clearAllNightTimers(room)

    // Preserve config so host doesn't need to re-enter settings each round
    const savedTimerConfig = room.state.timerConfig
    const savedRoleConfig  = room.state.roleConfig

    // Keep existing players but reset their game status
    const resetPlayers = room.state.players.map(p => ({
      ...p,
      role: null,
      isAlive: true,
      hasActed: false,
      isReady: p.isHost // Only host is ready by default, others must click ready again
    }))

    room.state = {
      ...gl.createGameState(roomCode, requesterId),
      players: resetPlayers,
      phase: gl.PHASES.LOBBY,
      timerConfig: savedTimerConfig, // Restore preserved config
      roleConfig: savedRoleConfig,
    }
    
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
  })


  // ── LEAVE ROOM & HOST TRANSFER ────────────────────────────────────────
  socket.on('leave_room', ({ roomCode, playerId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return

    // Remove player from room
    room.state.players = room.state.players.filter(p => p.id !== playerId)

    // If room is empty, delete it
    if (room.state.players.length === 0) {
      rm.deleteRoom(roomCode)
      return
    }

    // If the host left, transfer host to the oldest human player
    if (room.state.hostId === playerId) {
      const humans = room.state.players.filter(p => !p.isBot)
      if (humans.length > 0) {
        room.state.hostId = humans[0].id
        humans[0].isHost = true
        humans[0].isReady = true
      } else {
        rm.deleteRoom(roomCode)
        return
      }
    }

    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
    socket.leave(roomCode)
  })

  // ── KICK PLAYER ───────────────────────────────────────────────────────
  socket.on('kick_player', ({ roomCode, requesterId, targetId }) => {
    const room = rm.getRoom(roomCode)
    if (!room?.state) return
    if (room.state.hostId !== requesterId) return

    const target = room.state.players.find(p => p.id === targetId)
    if (!target) return

    room.state.players = room.state.players.filter(p => p.id !== targetId)
    rm.setRoomState(roomCode, room.state)
    broadcastState(roomCode)
    
    if (target.socketId) {
      io.to(target.socketId).emit('kicked')
    }
  })

  // ── DISCONNECT ────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] Socket disconnected: ${socket.id}`)
    // Player stays in their room state for reconnect grace period.
    // Room cleanup timer handles removal after 30 min inactivity.
  })
})

// ─── Start ────────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`\n🐺 Redwolf Server running on http://localhost:${PORT}`)
  console.log(`   Health: http://localhost:${PORT}/health\n`)
})
