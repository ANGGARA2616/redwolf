import { useGame, ROLES, ROLE_INFO } from '../context/GameContext'
import './MorningPage.css'

/** Build a dramatic narrative of what happened last night */
function buildNarrative(state) {
  const { lastVictim, lastSaved, nightActions, players } = state
  const { detektifTarget, detektifResult } = nightActions

  const victimPlayer = players.find(p => p.name === lastVictim)
  const victimRole   = victimPlayer ? ROLE_INFO[victimPlayer.role]?.label : 'Warga Desa'

  if (!lastVictim && lastSaved) {
    // Attacked but saved
    return {
      icon: '🛡️',
      headline: 'Tidak Ada Korban',
      narrative: `Semalam Serigala menyerang salah satu pemain, namun Dokter berhasil menyelamatkannya tepat waktu. Desa masih aman untuk saat ini.`,
      mood: 'saved',
    }
  }

  if (!lastVictim && !lastSaved) {
    // No attack (shouldn't normally happen, but handle gracefully)
    return {
      icon: '🌅',
      headline: 'Malam Berlalu dengan Tenang',
      narrative: `Semalam tidak ada kejadian yang tercatat. Desa berhasil melewati malam dengan selamat.`,
      mood: 'safe',
    }
  }

  // Victim killed
  const roleDesc = victimRole ?? 'Warga Desa'
  if (lastSaved) {
    // This case shouldn't happen (saved = no victim), but guard anyway
    return {
      icon: '☠️',
      headline: `${lastVictim} Dieliminasi`,
      narrative: `Semalam Serigala memangsa ${lastVictim} (${roleDesc}). Meskipun Dokter mencoba menyelamatkan, korban tidak berhasil diselamatkan.`,
      mood: 'killed',
    }
  }

  // Standard kill — check if dokter tried to save someone else
  return {
    icon: '☠️',
    headline: `${lastVictim} Dieliminasi`,
    narrative: `Semalam Serigala memangsa ${lastVictim} (${roleDesc}). Warga desa tersebut tidak berhasil diselamatkan oleh Dokter. Tubuh korban ditemukan saat fajar menyingsing.`,
    mood: 'killed',
  }
}

export default function MorningPage() {
  const { state, actions } = useGame()
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isDetektif = currentPlayer?.role === ROLES.DETEKTIF
  const isHost     = state.currentPlayerId === state.hostId
  const isAlive    = currentPlayer?.isAlive ?? false

  const { detektifTarget, detektifResult } = state.nightActions
  const investigatedPlayer = state.players.find(p => p.id === detektifTarget)

  const { icon, headline, narrative, mood } = buildNarrative(state)

  const moodColor = {
    killed: '#c0392b',
    saved:  '#1a7a57',
    safe:   '#9a7030',
  }[mood] ?? '#9a7030'

  return (
    <div className="page page-day">
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div className="morning-content animate-fade-in">

          {/* Header */}
          <div className="morning-header">
            <div className="morning-round-badge">Siklus {state.round} Selesai</div>
            <h1 className="morning-title">Laporan Pagi</h1>
          </div>

          {/* Main result card */}
          <div className={`morning-result-card animate-fade-in stagger-1 mood-${mood}`}>
            <div className="morning-result-icon">{icon}</div>
            <div className="morning-result-headline" style={{ color: moodColor }}>
              {headline}
            </div>
            <p className="morning-narrative">{narrative}</p>
          </div>

          {/* Alive players summary */}
          <div className="morning-alive-bar animate-fade-in stagger-2">
            <span className="morning-alive-label">Pemain Tersisa</span>
            <span className="morning-alive-count">
              {state.players.filter(p => p.isAlive).length}
            </span>
            <span className="morning-alive-label">dari {state.players.length}</span>
          </div>

          {/* Detective secret report */}
          {isDetektif && investigatedPlayer && (
            <div className="morning-detective animate-fade-in stagger-3">
              <div className="morning-detective-label">🔍 Laporan Rahasia — Detektif</div>
              <div className="morning-detective-result">
                <span className="morning-detective-name">{investigatedPlayer.name}</span>
                {' adalah '}
                <span style={{
                  color: detektifResult ? '#c0392b' : '#1a7a57',
                  fontWeight: 800,
                }}>
                  {detektifResult ? '🐺 SERIGALA' : '✅ BUKAN SERIGALA'}
                </span>
              </div>
              <div className="morning-detective-note">
                Informasi ini hanya terlihat oleh kamu. Gunakan dengan bijak.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="animate-fade-in stagger-4" style={{ marginTop: 24 }}>
            {isHost ? (
              <>
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
                  onClick={actions.resolveNight}
                  id="btn-continue-morning"
                >
                  ☀ Mulai Fase Diskusi
                </button>
              </>
            ) : isAlive ? (
              <div className="morning-waiting">
                <span className="morning-waiting-dot" />
                <span className="morning-waiting-dot" style={{ animationDelay: '0.2s' }} />
                <span className="morning-waiting-dot" style={{ animationDelay: '0.4s' }} />
                <p>Menunggu host melanjutkan ke fase diskusi...</p>
              </div>
            ) : (
              <div className="morning-waiting">
                <p>👁 Kamu sudah dieliminasi — saksikan permainan sebagai penonton.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
