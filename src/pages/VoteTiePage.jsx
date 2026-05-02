import { useGame } from '../context/GameContext'
import './VoteTiePage.css'

export default function VoteTiePage() {
  const { state, actions } = useGame()
  const { voteResult } = state

  if (!voteResult) return null

  const { tally, tiedNames } = voteResult

  // Sort by vote count descending for the bar chart
  const tallyEntries = Object.entries(tally)
    .map(([id, count]) => ({
      player: state.players.find(p => p.id === id),
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const maxVotes = Math.max(...tallyEntries.map(e => e.count), 1)

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isHost = state.currentPlayerId === state.hostId
  const isAlive = currentPlayer?.isAlive ?? false

  return (
    <div className="page page-day">
      <div className="bg-grid" />
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>

        <div className="tie-header animate-fade-in">
          <div className="tie-badge">Hasil Seri</div>
          <h1 className="heading-lg text-center mt-md">
            Tidak Ada Keputusan
          </h1>
          <p className="text-sm text-muted text-center mt-sm">
            Suara terpecah secara merata. Tidak ada pemain yang dieliminasi ronde ini.
          </p>
        </div>

        <div className="tie-chart animate-fade-in-up stagger-1">
          <div className="tie-chart-label">Distribusi Suara</div>
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
                      background: state.tiedCandidateIds.includes(player.id)
                        ? 'linear-gradient(90deg, var(--amber-primary), var(--amber-glow))'
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

        <div className="tie-info animate-fade-in stagger-2">
          <div className="tie-info-row">
            <div className="tie-info-icon">⚖</div>
            <div>
              <div className="tie-info-title">Kandidat Seri</div>
              <div className="tie-info-desc">{tiedNames}</div>
            </div>
          </div>
          <div className="tie-info-rule">
            Berdasarkan peraturan: jika terjadi seri, permainan berlanjut ke siklus malam berikutnya tanpa eliminasi.
          </div>
        </div>

        {isHost ? (
          <div className="animate-fade-in stagger-3 mt-xl">
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
              style={{ marginBottom: '12px' }}
              onClick={actions.nextRound}
              id="btn-tie-next-round"
            >
              Lanjutkan ke Malam Berikutnya
            </button>
            <button
              className="btn btn-secondary btn-lg btn-full"
              onClick={actions.revote}
              id="btn-revote"
            >
              Voting Ulang
            </button>
          </div>
        ) : isAlive ? (
          <div className="tie-waiting animate-fade-in stagger-3">
            Menunggu host melanjutkan permainan...
          </div>
        ) : (
          <div className="tie-waiting animate-fade-in stagger-3" style={{ animation: 'none' }}>
            👁 Kamu sudah dieliminasi — saksikan permainan sebagai penonton.
          </div>
        )}
      </div>
    </div>
  )
}
