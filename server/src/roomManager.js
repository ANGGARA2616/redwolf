/**
 * roomManager.js
 * In-memory store for all active game rooms.
 * Each room entry = { state, nightTimers }
 */

const rooms = new Map()   // roomCode → { state, nightTimers: Map }

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'WOLF-'
  for (let i = 0; i < 2; i++) code += chars[Math.floor(Math.random() * chars.length)]
  // Re-roll if collision (extremely rare but safe)
  return rooms.has(code) ? generateRoomCode() : code
}

function createRoom(hostId) {
  const roomCode = generateRoomCode()
  rooms.set(roomCode, { state: null, nightTimers: new Map() })
  return roomCode
}

function getRoom(roomCode) {
  return rooms.get(roomCode) ?? null
}

function setRoomState(roomCode, state) {
  const room = rooms.get(roomCode)
  if (!room) return
  room.state = state
}

function deleteRoom(roomCode) {
  const room = rooms.get(roomCode)
  if (room) {
    // Cancel any running timers
    room.nightTimers.forEach(t => clearTimeout(t))
    rooms.delete(roomCode)
  }
}

function roomExists(roomCode) {
  return rooms.has(roomCode)
}

function listRooms() {
  return [...rooms.entries()].map(([code, room]) => ({
    code,
    playerCount: room.state?.players?.length ?? 0,
    phase: room.state?.phase ?? 'unknown',
  }))
}

// Auto-cleanup rooms inactive for > 30 minutes
const ROOM_TTL_MS = 30 * 60 * 1000
function scheduleRoomCleanup(roomCode) {
  return setTimeout(() => deleteRoom(roomCode), ROOM_TTL_MS)
}

module.exports = {
  createRoom,
  getRoom,
  setRoomState,
  deleteRoom,
  roomExists,
  listRooms,
  scheduleRoomCleanup,
}
