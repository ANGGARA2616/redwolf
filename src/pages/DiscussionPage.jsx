import { useGame } from '../context/GameContext'
import Timer from '../components/Timer'
import { DaySilhouette } from '../components/Silhouette'
import './DiscussionPage.css'

export default function DiscussionPage() {
  const { state, actions } = useGame()
  const alivePlayers = state.players.filter(p => p.isAlive)
  const isHost       = state.currentPlayerId === state.hostId
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isAlive      = currentPlayer?.isAlive ?? false
  const timerDuration = state.timerConfig?.discussion || 300

  function handleEndDiscussion() {
    actions.endDiscussion(state.currentPlayerId)
  }

  return (
    <div className="page page-day">
      <DaySilhouette />
      <div className="bg-grid" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>

        <div className="discussion-header animate-fade-in">
          <h1 className="heading-lg text-center">Fase Diskusi</h1>
          <p className="text-sm text-muted text-center mt-sm">
            Gunakan waktu ini untuk menganalisis dan mengidentifikasi ancaman.
          </p>
        </div>

        <div className="discussion-timer animate-fade-in-scale stagger-1">
          <Timer
            duration={timerDuration}
            onComplete={handleEndDiscussion}
            color="var(--amber-primary)"
            variant="bar"
            label="waktu diskusi tersisa"
          />
          <p className="text-xs text-muted mt-sm text-center">
            Pemungutan suara dimulai otomatis saat waktu habis
          </p>
        </div>

        {/* Eliminated notice for dead non-host players */}
        {!isAlive && !isHost && (
          <div className="discussion-spectator animate-fade-in stagger-2">
            👁 Kamu sudah dieliminasi — saksikan diskusi sebagai penonton.
          </div>
        )}

        {/* Eliminated notice for dead host — they still control the game */}
        {!isAlive && isHost && (
          <div className="discussion-host-dead animate-fade-in stagger-2">
            ⚙ Kamu sudah dieliminasi, tapi masih mengelola jalannya permainan sebagai host.
          </div>
        )}

        <div className="discussion-players animate-fade-in stagger-2">
          <div className="discussion-alive-label">
            Pemain Aktif — {alivePlayers.length} tersisa
          </div>
          <div className="player-list">
            {state.players.map(player => (
              <div
                key={player.id}
                className={`player-item ${!player.isAlive ? 'dead' : ''}`}
              >
                <div className="player-avatar"
                  style={{
                    background: player.isAlive ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.03)',
                  }}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <span className="player-name">{player.name}</span>
                <span className="player-status" style={{
                  color: player.isAlive ? 'var(--green-primary)' : 'var(--text-tertiary)'
                }}>
                  {player.isAlive ? 'Aktif' : 'Eliminasi'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Host (alive OR dead) controls */}
        {isHost ? (
          <button
            className="btn btn-primary btn-lg btn-full mt-lg animate-fade-in stagger-3"
            onClick={handleEndDiscussion}
            id="btn-skip-discussion"
          >
            Mulai Pemungutan Suara
          </button>
        ) : isAlive ? (
          <div className="discussion-waiting animate-fade-in stagger-3">
            Menunggu host memulai pemungutan suara...
          </div>
        ) : null}
      </div>
    </div>
  )
}
