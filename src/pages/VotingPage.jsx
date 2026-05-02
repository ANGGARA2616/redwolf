import { useState } from 'react'
import { useGame } from '../context/GameContext'
import Timer from '../components/Timer'
import './VotingPage.css'

export default function VotingPage() {
  const { state, actions } = useGame()
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isAlive = currentPlayer?.isAlive ?? false
  const isHost  = state.currentPlayerId === state.hostId
  const timerDuration = state.timerConfig?.voting || 30

  // All alive players except self (for voting targets)
  const alivePlayers = state.players.filter(p => p.isAlive && p.id !== currentPlayer?.id)

  function handleSubmit() {
    if (!selected || !isAlive) return
    actions.castVote(state.currentPlayerId, selected)
    setSubmitted(true)
  }

  function handleTimeout() {
    if (!isAlive) return // dead players don't auto-vote
    if (!submitted) {
      const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)]
      if (target) {
        setSelected(target.id)
        actions.castVote(state.currentPlayerId, target.id)
      }
      setSubmitted(true)
    }
  }

  // ── SPECTATOR view (dead players) ─────────────────────────────────────
  if (!isAlive) {
    return (
      <div className="page page-day">
        <div className="bg-grid" />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="voting-header animate-fade-in">
            <h1 className="heading-lg text-center">Pemungutan Suara</h1>
            <p className="text-sm text-muted text-center mt-sm">
              Ronde {state.round}
            </p>
          </div>

          {/* Spectator / eliminated notice */}
          <div className="voting-spectator animate-fade-in stagger-1">
            <div className="voting-spectator-icon">👁</div>
            <div className="voting-spectator-title">Kamu sudah dieliminasi</div>
            <p className="voting-spectator-desc">
              Kamu tidak dapat memberikan suara. Saksikan jalannya pemungutan suara sebagai penonton.
            </p>
          </div>

          {/* Live vote progress for spectators */}
          <div className="voting-live animate-fade-in stagger-2">
            <div className="voting-live-label">Pemain yang memilih:</div>
            <div className="player-list">
              {state.players.filter(p => p.isAlive).map(player => {
                const hasVoted = !!(state.votes?.[player.id])
                return (
                  <div key={player.id} className="player-item">
                    <div className="player-avatar">{player.name[0].toUpperCase()}</div>
                    <span className="player-name">{player.name}</span>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: hasVoted ? 'var(--green-primary)' : 'var(--text-tertiary)',
                    }}>
                      {hasVoted ? '✓ Sudah' : 'Menunggu'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Host controls: even if dead, host can still manage game flow */}
          {isHost && (
            <div className="voting-host-dead-note animate-fade-in stagger-3">
              <span>⚙</span> Kamu adalah host — kamu masih bisa mengelola jalannya permainan.
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── SUBMITTED view ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page page-day">
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="voting-submitted animate-fade-in-scale">
            <h2 className="heading-md text-center">Suara Terkirim ✓</h2>
            <p className="text-sm text-muted text-center mt-sm">
              Menunggu konfirmasi dari seluruh pemain aktif...
            </p>
            <div className="voting-submitted-dots">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── ACTIVE VOTE view ─────────────────────────────────────────────────
  return (
    <div className="page page-day">
      <div className="bg-grid" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="voting-header animate-fade-in">
          <h1 className="heading-lg text-center">Pemungutan Suara</h1>
          <p className="text-sm text-muted text-center mt-sm">
            Tentukan satu pemain yang akan dieliminasi dari permainan.
          </p>
        </div>

        <div className="voting-timer animate-fade-in stagger-1">
          <Timer
            duration={timerDuration}
            onComplete={handleTimeout}
            color="var(--red-primary)"
            variant="bar"
            label="waktu voting tersisa"
          />
        </div>

        <div className="player-list animate-fade-in stagger-2">
          {alivePlayers.map(player => (
            <div
              key={player.id}
              className={`player-item selectable ${selected === player.id ? 'selected' : ''}`}
              onClick={() => setSelected(player.id)}
              id={`vote-player-${player.id}`}
            >
              <div className="player-avatar">{player.name[0].toUpperCase()}</div>
              <span className="player-name">{player.name}</span>
              {selected === player.id && (
                <span style={{ color: 'var(--red-primary)', fontWeight: 600, fontSize: 14 }}>
                  Dipilih
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-lg btn-full mt-lg animate-fade-in stagger-3"
          onClick={handleSubmit}
          disabled={!selected}
          id="btn-submit-vote"
        >
          Konfirmasi Pilihan
        </button>

        <p className="text-xs text-muted text-center mt-md">
          Pemungutan suara bersifat rahasia.
        </p>
      </div>
    </div>
  )
}
