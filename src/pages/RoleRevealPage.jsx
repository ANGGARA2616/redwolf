import { useGame, ROLE_INFO } from '../context/GameContext'
import './RoleRevealPage.css'

export default function RoleRevealPage() {
  const { state, actions } = useGame()
  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const roleInfo = ROLE_INFO[currentPlayer?.role]

  if (!roleInfo) return null

  const colorMap = {
    wolf: 'var(--red-primary)',
    dokter: 'var(--green-primary)',
    detektif: 'var(--blue-primary)',
    warga: 'var(--text-secondary)',
  }

  const glowMap = {
    wolf: 'rgba(226, 75, 74, 0.2)',
    dokter: 'rgba(29, 158, 117, 0.2)',
    detektif: 'rgba(55, 138, 221, 0.2)',
    warga: 'rgba(255, 255, 255, 0.05)',
  }

  const accentColor = colorMap[roleInfo.color]
  const glowColor = glowMap[roleInfo.color]

  const isWerewolf = currentPlayer?.role === 'werewolf'
  const otherWerewolves = state.players.filter(p => p.id !== currentPlayer.id && p.role === 'werewolf')

  return (
    <div className="page page-dark">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="role-reveal animate-fade-in-scale">
          <div className="role-reveal-warning">
            Peringatan: Jaga kerahasiaan layar Anda dari pemain lain.
          </div>

          <div className="role-reveal-card" style={{
            borderColor: accentColor,
            boxShadow: `0 0 60px ${glowColor}`,
          }}>
            <div className="role-emoji" style={{ color: accentColor }}>
              {roleInfo.label.charAt(0)}
            </div>
            <div className="role-label" style={{ color: accentColor }}>
              {roleInfo.label}
            </div>
            <div className="role-team">
              Faksi {roleInfo.team === 'jahat' ? 'Jahat' : 'Baik'}
            </div>
            <div className="role-desc">{roleInfo.description}</div>
            
            {isWerewolf && otherWerewolves.length > 0 && (
              <div className="role-partners" style={{ marginTop: '16px', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: `1px solid rgba(226, 75, 74, 0.3)` }}>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Rekan Serigala Anda:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
                  {otherWerewolves.map(p => (
                    <span key={p.id} style={{ padding: '2px 8px', background: 'rgba(226, 75, 74, 0.15)', color: 'var(--red-glow)', borderRadius: '4px', fontSize: '13px', fontWeight: 600 }}>
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {currentPlayer?.hasActed ? (
            <div className="role-reveal-waiting mt-xl" style={{ color: accentColor, fontWeight: 600 }}>
              Menunggu pemain lain konfirmasi...
            </div>
          ) : (
            <button
              className="btn btn-lg btn-full mt-xl"
              style={{ background: accentColor, color: '#fff' }}
              onClick={actions.acknowledgeRole}
              id="btn-acknowledge-role"
            >
              Mengerti
            </button>
          )}

          <p className="text-xs text-muted text-center mt-md">
            Layar akan beralih ke mode malam setelah konfirmasi dari seluruh pemain.
          </p>
        </div>
      </div>
    </div>
  )
}
