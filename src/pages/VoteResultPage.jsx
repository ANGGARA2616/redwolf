import { useGame, ROLE_INFO } from '../context/GameContext'
import './VoteResultPage.css'

export default function VoteResultPage() {
  const { state, actions } = useGame()
  const { voteResult } = state
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isHost = state.currentPlayerId === state.hostId
  const isAlive = currentPlayer?.isAlive ?? false

  if (!voteResult) return null

  const { tally, eliminatedPlayer } = voteResult
  const roleInfo = ROLE_INFO[eliminatedPlayer?.role]

  // Sort tally for display
  const tallyEntries = Object.entries(tally)
    .map(([id, count]) => ({
      player: state.players.find(p => p.id === id),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const maxVotes = Math.max(...tallyEntries.map(e => e.count), 1)

  return (
    <div className="page page-day">
      <div className="bg-grid" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>

        <div className="vr-header animate-fade-in">
          <h1 className="heading-lg text-center">Rekapitulasi Suara</h1>
          <p className="text-sm text-muted text-center mt-sm">
            Ronde {state.round}
          </p>
        </div>

        <div className="vr-chart animate-fade-in-up stagger-1">
          <div className="vote-bar-container">
            {tallyEntries.map(({ player, count }, i) => (
              <div
                key={player.id}
                className={`vote-row animate-fade-in stagger-${Math.min(i + 1, 5)}`}
              >
                <span className="vote-name">{player.name}</span>
                <div className="vote-track">
                  <div
                    className="vote-fill"
                    style={{
                      width: `${(count / maxVotes) * 100}%`,
                      background: player.id === eliminatedPlayer?.id
                        ? 'linear-gradient(90deg, var(--red-primary), var(--red-glow))'
                        : 'linear-gradient(90deg, var(--bg-elevated), var(--text-tertiary))',
                    }}
                  >
                    <span className="vote-count">{count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="vr-eliminated animate-fade-in-scale stagger-3">
          <div className="vr-eliminated-label">Keputusan Eliminasi</div>
          <div className="vr-eliminated-name">{eliminatedPlayer?.name}</div>
          <div className="vr-eliminated-role">
            <span className={`badge badge-${roleInfo?.color}`}>
              {roleInfo?.label}
            </span>
          </div>
          <div className="vr-eliminated-team">
            Afiliasi Faksi: {roleInfo?.team === 'jahat' ? 'Jahat' : 'Baik'}
          </div>
        </div>

        {/* Controls */}
        {isHost ? (
          <div className="animate-fade-in stagger-4">
            {!isAlive && (
              <div style={{
                padding: '8px 14px',
                background: 'rgba(226,75,74,0.06)',
                border: '1px solid rgba(226,75,74,0.2)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 12,
                color: '#8b3030',
                textAlign: 'center',
                marginBottom: 12,
              }}>
                ⚙ Kamu sudah dieliminasi, tapi masih mengelola permainan sebagai host.
              </div>
            )}
            <button
              className="btn btn-primary btn-lg btn-full"
              style={{ marginBottom: !state.winner ? '12px' : '0' }}
              onClick={actions.nextRound}
              id="btn-continue-vote-result"
            >
              {state.winner ? 'Lihat Hasil Akhir' : 'Lanjutkan ke Siklus Berikutnya'}
            </button>
            {!state.winner && (
              <button
                className="btn btn-secondary btn-lg btn-full"
                onClick={actions.revote}
                id="btn-revote"
              >
                Voting Ulang
              </button>
            )}
          </div>
        ) : isAlive ? (
          <div className="vr-waiting animate-fade-in stagger-4">
            Menunggu host melanjutkan permainan...
          </div>
        ) : (
          <div className="vr-waiting animate-fade-in stagger-4" style={{ animation: 'none' }}>
            👁 Kamu sudah dieliminasi — saksikan permainan sebagai penonton.
          </div>
        )}
      </div>
    </div>
  )
}
