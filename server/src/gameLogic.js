/**
 * gameLogic.js
 * Core game state machine — mirrors the frontend GameContext reducer.
 * All game decisions happen here on the server; the frontend is a pure view.
 */

const ROLES = {
  WEREWOLF: 'werewolf',
  DOKTER: 'dokter',
  DETEKTIF: 'detektif',
  WARGA: 'warga',
}

const ROLE_INFO = {
  werewolf: { label: 'Serigala', team: 'jahat' },
  dokter:   { label: 'Dokter',   team: 'baik' },
  detektif: { label: 'Detektif', team: 'baik' },
  warga:    { label: 'Warga Desa', team: 'baik' },
}

const PHASES = {
  LOBBY:          'lobby',
  ROLE_REVEAL:    'role_reveal',
  NIGHT_WEREWOLF: 'night_werewolf',
  NIGHT_DOKTER:   'night_dokter',
  NIGHT_DETEKTIF: 'night_detektif',
  MORNING:        'morning',
  DISCUSSION:     'discussion',
  VOTING:         'voting',
  VOTE_TIE:       'vote_tie',
  VOTE_RESULT:    'vote_result',
  GAME_OVER:      'game_over',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Compute night result (victim / saved) and apply player state.
 * Called automatically when any night path leads to MORNING phase.
 */
function computeNightResult(state) {
  const { werewolfTarget, dokterTarget } = state.nightActions
  const saved  = werewolfTarget && werewolfTarget === dokterTarget
  const victim = saved ? null : werewolfTarget

  const updatedPlayers = state.players.map(p =>
    p.id === victim ? { ...p, isAlive: false } : p
  )
  const victimName = victim ? state.players.find(p => p.id === victim)?.name : null

  return {
    ...state,
    players:    updatedPlayers,
    lastVictim: victimName,
    lastSaved:  !!saved,
    gameLog: [
      ...state.gameLog,
      {
        round: state.round,
        event: saved
          ? `Malam ${state.round}: Tidak ada korban (diselamatkan Dokter).`
          : victimName
            ? `Malam ${state.round}: ${victimName} dieliminasi.`
            : `Malam ${state.round}: Tidak ada korban.`,
      },
    ],
  }
}

/**
 * Compute default role counts based on player count.
 * 5-6 players: 1 werewolf, 1 dokter, 1 detektif
 * 7-15 players: 2 werewolves, 1 dokter, 1 detektif
 */
function getDefaultRoleConfig(playerCount) {
  return {
    werewolf: playerCount <= 6 ? 1 : 2,
    dokter: 1,
    detektif: 1,
  }
}

function assignRoles(players, roleConfig) {
  const count = players.length
  const config = roleConfig || getDefaultRoleConfig(count)

  const wolfCount    = Math.max(0, Math.min(config.werewolf ?? 1, count - 1))
  const dokterCount  = Math.max(0, Math.min(config.dokter ?? 1, count - wolfCount))
  const detektifCount = Math.max(0, Math.min(config.detektif ?? 1, count - wolfCount - dokterCount))

  const shuffled = shuffle(players)
  let idx = 0

  return shuffled.map((player) => {
    let role
    if (idx < wolfCount)                              role = ROLES.WEREWOLF
    else if (idx < wolfCount + dokterCount)            role = ROLES.DOKTER
    else if (idx < wolfCount + dokterCount + detektifCount) role = ROLES.DETEKTIF
    else                                               role = ROLES.WARGA
    idx++
    return { ...player, role, isAlive: true, hasActed: false }
  })
}

function checkWinCondition(players) {
  const wolves    = players.filter(p => p.role === ROLES.WEREWOLF && p.isAlive)
  const villagers = players.filter(p => p.role !== ROLES.WEREWOLF && p.isAlive)
  if (wolves.length === 0)              return 'warga'
  if (wolves.length >= villagers.length) return 'werewolf'
  return null
}

// ─── Game State Factory ───────────────────────────────────────────────────

function createGameState(roomCode, hostId) {
  return {
    roomCode,
    hostId,
    phase: PHASES.LOBBY,
    players: [],          // { id, name, socketId, role, isAlive, isReady, isBot }
    round: 0,
    roleConfig: null,     // null = use defaults; { werewolf, dokter, detektif }
    timerConfig: {
      werewolf: 30,
      dokter: 7,
      detektif: 6,
      discussion: 300,
      voting: 30
    },
    activeRoles: { werewolf: true, dokter: true, detektif: true },
    nightActions: {
      werewolfTarget: null,
      dokterTarget:   null,
      detektifTarget: null,
      detektifResult: null,
    },
    votes: {},            // { voterId: targetId }
    voteResult: null,
    tiedCandidateIds: [],
    lastVictim: null,
    lastSaved: false,
    winner: null,
    gameLog: [],
  }
}

// ─── Action Handlers ─────────────────────────────────────────────────────

function updateConfig(state, { roleConfig, timerConfig }) {
  return { ...state, roleConfig, timerConfig }
}


function addPlayer(state, { playerId, name, socketId, isHost = false }) {
  if (state.players.find(p => p.id === playerId)) return state   // already in room
  return {
    ...state,
    players: [
      ...state.players,
      { id: playerId, name, socketId, role: null, isAlive: true, isReady: isHost, isBot: false, isHost },
    ],
  }
}

function updateSocketId(state, { playerId, socketId }) {
  return {
    ...state,
    players: state.players.map(p => p.id === playerId ? { ...p, socketId } : p),
  }
}

function addBot(state, { name }) {
  if (state.players.length >= 15) return state
  const botId = 'bot-' + Date.now() + Math.random().toString(36).slice(2, 5)
  return {
    ...state,
    players: [
      ...state.players,
      { id: botId, name, socketId: null, role: null, isAlive: true, isReady: true, isBot: true, isHost: false },
    ],
  }
}

function toggleReady(state, { playerId }) {
  return {
    ...state,
    players: state.players.map(p =>
      p.id === playerId ? { ...p, isReady: !p.isReady } : p
    ),
  }
}

function startGame(state, { requesterId, roleConfig }) {
  if (requesterId !== state.hostId)                     return { state, error: 'Hanya host yang bisa memulai game.' }
  if (state.players.length < 5)                         return { state, error: 'Minimal 5 pemain.' }
  if (!state.players.every(p => p.isReady))             return { state, error: 'Tidak semua pemain sudah siap.' }

  // Validate custom config if provided
  const config = roleConfig || null
  if (config) {
    const total = (config.werewolf || 0) + (config.dokter || 0) + (config.detektif || 0)
    if (total >= state.players.length) return { state, error: 'Jumlah kartu spesial tidak boleh melebihi jumlah pemain.' }
    if ((config.werewolf || 0) < 1) return { state, error: 'Minimal harus ada 1 Serigala.' }
  }

  const assigned = assignRoles(state.players, config)
  const effectiveConfig = config || getDefaultRoleConfig(state.players.length)

  return {
    state: {
      ...state,
      players: assigned,
      phase:   PHASES.ROLE_REVEAL,
      round:   1,
      roleConfig: config,
      activeRoles: {
        werewolf: (effectiveConfig.werewolf || 0) > 0,
        dokter:   (effectiveConfig.dokter || 0) > 0,
        detektif: (effectiveConfig.detektif || 0) > 0,
      },
      gameLog: [{ round: 0, event: 'Permainan dimulai.' }],
    },
  }
}

function acknowledgeRole(state, { playerId }) {
  // Mark this player as acknowledged; once ALL alive HUMAN players ack, advance phase
  const updatedPlayers = state.players.map(p =>
    p.id === playerId ? { ...p, hasActed: true } : p
  )
  const allAcknowledged = updatedPlayers.filter(p => p.isAlive && !p.isBot).every(p => p.hasActed)
  
  return {
    ...state,
    players: updatedPlayers,
    phase: allAcknowledged ? PHASES.NIGHT_WEREWOLF : state.phase,
    // Reset hasActed for next usage when entering night
    ...(allAcknowledged && { players: updatedPlayers.map(p => ({ ...p, hasActed: false })) }),
    nightActions: allAcknowledged
      ? { werewolfTarget: null, dokterTarget: null, detektifTarget: null, detektifResult: null }
      : state.nightActions,
  }
}

function werewolfAction(state, { requesterId, targetId }) {
  const requester = state.players.find(p => p.id === requesterId)
  if (!requester || requester.role !== ROLES.WEREWOLF) return state

  // Determine next phase: skip dokter if not active
  let nextPhase = PHASES.NIGHT_DOKTER
  if (!state.activeRoles.dokter) {
    nextPhase = state.activeRoles.detektif ? PHASES.NIGHT_DETEKTIF : PHASES.MORNING
  }

  const partial = {
    ...state,
    nightActions: { ...state.nightActions, werewolfTarget: targetId },
    phase: nextPhase,
  }
  // If we're heading straight to MORNING, compute result now
  return nextPhase === PHASES.MORNING ? computeNightResult(partial) : partial
}

function dokterAction(state, { requesterId, targetId }) {
  const requester = state.players.find(p => p.id === requesterId)
  if (!requester || requester.role !== ROLES.DOKTER) return state

  // Skip detektif phase if not active
  const nextPhase = state.activeRoles.detektif ? PHASES.NIGHT_DETEKTIF : PHASES.MORNING

  const partial = {
    ...state,
    nightActions: { ...state.nightActions, dokterTarget: targetId },
    phase: nextPhase,
  }
  return nextPhase === PHASES.MORNING ? computeNightResult(partial) : partial
}

function detektifAction(state, { requesterId, targetId }) {
  const requester = state.players.find(p => p.id === requesterId)
  if (!requester || requester.role !== ROLES.DETEKTIF) return state

  const target = state.players.find(p => p.id === targetId)
  const partial = {
    ...state,
    nightActions: {
      ...state.nightActions,
      detektifTarget: targetId,
      detektifResult: target?.role === ROLES.WEREWOLF,
    },
    phase: PHASES.MORNING,
  }
  return computeNightResult(partial)
}

function skipNightAction(state) {
  if (state.phase === PHASES.NIGHT_WEREWOLF) {
    // Auto-pick random non-wolf alive player
    const candidates = state.players.filter(p => p.isAlive && p.role !== ROLES.WEREWOLF)
    const target = candidates[Math.floor(Math.random() * candidates.length)]
    let nextPhase = PHASES.NIGHT_DOKTER
    if (!state.activeRoles.dokter) {
      nextPhase = state.activeRoles.detektif ? PHASES.NIGHT_DETEKTIF : PHASES.MORNING
    }
    const partial = { ...state, nightActions: { ...state.nightActions, werewolfTarget: target?.id }, phase: nextPhase }
    return nextPhase === PHASES.MORNING ? computeNightResult(partial) : partial
  }
  if (state.phase === PHASES.NIGHT_DOKTER) {
    const nextPhase = state.activeRoles.detektif ? PHASES.NIGHT_DETEKTIF : PHASES.MORNING
    const partial = { ...state, nightActions: { ...state.nightActions, dokterTarget: null }, phase: nextPhase }
    return nextPhase === PHASES.MORNING ? computeNightResult(partial) : partial
  }
  if (state.phase === PHASES.NIGHT_DETEKTIF) {
    const partial = { ...state, nightActions: { ...state.nightActions, detektifTarget: null, detektifResult: null }, phase: PHASES.MORNING }
    return computeNightResult(partial)
  }
  return state
}

/**
 * Host advances from MORNING → DISCUSSION (or GAME_OVER if someone's death triggered win).
 * Night result (lastVictim/lastSaved) is already computed when entering MORNING phase.
 */
function resolveNight(state, { requesterId }) {
  if (requesterId !== state.hostId) return state

  // Check win condition based on current alive players (victim already removed)
  const winner = checkWinCondition(state.players)

  return {
    ...state,
    phase: winner ? PHASES.GAME_OVER : PHASES.DISCUSSION,
    winner,
  }
}

function endDiscussion(state, { requesterId }) {
  if (requesterId !== state.hostId) return state
  return { ...state, phase: PHASES.VOTING, votes: {}, tiedCandidateIds: [] }
}

function castVote(state, { voterId, targetId }) {
  // Only alive players may vote
  const voter = state.players.find(p => p.id === voterId && p.isAlive)
  if (!voter) return state
  return { ...state, votes: { ...state.votes, [voterId]: targetId } }
}

function resolveVotes(state) {
  const aliveCandidates = new Set(state.players.filter(p => p.isAlive).map(p => p.id))
  const tally = {}
  Object.values(state.votes).forEach(targetId => {
    if (aliveCandidates.has(targetId)) {
      tally[targetId] = (tally[targetId] || 0) + 1
    }
  })

  const maxVotes = Math.max(0, ...Object.values(tally))
  const topIds   = Object.entries(tally).filter(([, c]) => c === maxVotes).map(([id]) => id)

  // TIE — no elimination
  if (topIds.length > 1) {
    const tiedNames = topIds.map(id => state.players.find(p => p.id === id)?.name).filter(Boolean).join(', ')
    return {
      ...state,
      voteResult: { tally, eliminated: null, eliminatedPlayer: null, isTie: true, tiedNames },
      tiedCandidateIds: topIds,
      phase: PHASES.VOTE_TIE,
      gameLog: [
        ...state.gameLog,
        { round: state.round, event: `Voting Ronde ${state.round}: Seri (${tiedNames}) — tidak ada eliminasi.` },
      ],
    }
  }

  // CLEAR WINNER
  const eliminated       = topIds[0] ?? null
  const eliminatedPlayer = state.players.find(p => p.id === eliminated) ?? null
  const updatedPlayers   = state.players.map(p => p.id === eliminated ? { ...p, isAlive: false } : p)
  const winner           = checkWinCondition(updatedPlayers)

  return {
    ...state,
    players: updatedPlayers,
    voteResult: { tally, eliminated, eliminatedPlayer, isTie: false },
    tiedCandidateIds: [],
    phase: PHASES.VOTE_RESULT,
    winner,
    gameLog: [
      ...state.gameLog,
      {
        round: state.round,
        event: `Voting Ronde ${state.round}: ${eliminatedPlayer?.name} dieliminasi (${ROLE_INFO[eliminatedPlayer?.role]?.label}).`,
      },
    ],
  }
}

function nextRound(state, { requesterId }) {
  if (requesterId !== state.hostId) return state
  if (state.winner) return { ...state, phase: PHASES.GAME_OVER }

  // Recompute active roles based on who is still alive
  const alivePlayers = state.players.filter(p => p.isAlive)
  const activeRoles = {
    werewolf: alivePlayers.some(p => p.role === ROLES.WEREWOLF),
    dokter:   alivePlayers.some(p => p.role === ROLES.DOKTER),
    detektif: alivePlayers.some(p => p.role === ROLES.DETEKTIF),
  }

  return {
    ...state,
    round: state.round + 1,
    phase: PHASES.NIGHT_WEREWOLF,
    activeRoles,
    nightActions: { werewolfTarget: null, dokterTarget: null, detektifTarget: null, detektifResult: null },
    votes: {},
    tiedCandidateIds: [],
    voteResult: null,
    lastVictim: null,
    lastSaved: false,
    players: state.players.map(p => ({ ...p, hasActed: false })),
  }
}

function revote(state, { requesterId }) {
  if (requesterId !== state.hostId) return state
  if (state.phase !== PHASES.VOTE_RESULT && state.phase !== PHASES.VOTE_TIE) return state

  // Restore the eliminated player's life if there was one
  let updatedPlayers = state.players
  if (state.voteResult && state.voteResult.eliminated) {
    updatedPlayers = state.players.map(p => 
      p.id === state.voteResult.eliminated ? { ...p, isAlive: true } : p
    )
  }

  return {
    ...state,
    phase: PHASES.VOTING,
    votes: {},
    voteResult: null,
    tiedCandidateIds: [],
    winner: null,
    players: updatedPlayers,
    gameLog: [
      ...state.gameLog,
      { round: state.round, event: `Voting Ronde ${state.round} diulang oleh Host.` }
    ]
  }
}

// ─── Projection: what each player is allowed to see ───────────────────────

/**
 * Build a "view" of the game state safe for a specific player.
 * Roles of OTHER players are hidden unless the game is over.
 * The detektif result is only sent to the detektif themselves.
 */
function buildPlayerView(state, playerId) {
  const viewer         = state.players.find(p => p.id === playerId)
  const isGameOver     = state.phase === PHASES.GAME_OVER
  const isWerewolf     = viewer?.role === ROLES.WEREWOLF
  const isDetektif     = viewer?.role === ROLES.DETEKTIF

  const players = state.players.map(p => {
    const isSelf  = p.id === playerId
    const revealRole = isSelf || isGameOver || (isWerewolf && p.role === ROLES.WEREWOLF)
    return {
      id:       p.id,
      name:     p.name,
      isAlive:  p.isAlive,
      isHost:   p.isHost,
      isBot:    p.isBot,
      isReady:  p.isReady,
      hasActed: p.hasActed,
      role:     revealRole ? p.role : undefined,
    }
  })

  // Only send detektif result to the detektif
  const nightActions = {
    ...state.nightActions,
    detektifResult: isDetektif ? state.nightActions.detektifResult : undefined,
    detektifTarget: isDetektif ? state.nightActions.detektifTarget : undefined,
    // Never expose werewolf / dokter targets to anyone (they're irrelevant client-side)
    werewolfTarget: undefined,
    dokterTarget:   undefined,
  }

  return {
    phase:           state.phase,
    roomCode:        state.roomCode,
    hostId:          state.hostId,
    round:           state.round,
    players,
    currentPlayerId: playerId,
    myRole:          viewer?.role,
    roleConfig:      state.roleConfig,
    timerConfig:     state.timerConfig,
    activeRoles:     state.activeRoles,
    nightActions,
    lastVictim:      state.lastVictim,
    lastSaved:       state.lastSaved,
    votes:           state.phase === PHASES.VOTE_RESULT || isGameOver ? state.votes : undefined,
    voteResult:      state.voteResult,
    tiedCandidateIds: state.tiedCandidateIds,
    winner:          state.winner,
    gameLog:         state.gameLog,
  }
}

module.exports = {
  PHASES,
  ROLES,
  ROLE_INFO,
  getDefaultRoleConfig,
  createGameState,
  updateConfig,
  addPlayer,
  updateSocketId,
  addBot,
  toggleReady,
  startGame,
  acknowledgeRole,
  werewolfAction,
  dokterAction,
  detektifAction,
  skipNightAction,
  resolveNight,
  endDiscussion,
  castVote,
  resolveVotes,
  nextRound,
  revote,
  buildPlayerView,
}
