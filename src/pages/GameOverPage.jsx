import { useGame, ROLE_INFO } from '../context/GameContext'
import './GameOverPage.css'

export default function GameOverPage() {
  const { state, actions } = useGame()

  const isWerewolfWin = state.winner === 'werewolf'
  const isHost = state.currentPlayerId === state.hostId

  return (
    <div className="page">
      <div className="bg-grid" />
      <div className="go-bg-glow" style={{
        background: isWerewolfWin
          ? 'radial-gradient(circle, rgba(226, 75, 74, 0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(29, 158, 117, 0.1) 0%, transparent 70%)',
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="go-header animate-fade-in-scale">
          <h1 className="heading-xl text-center" style={{
            color: isWerewolfWin ? 'var(--red-primary)' : 'var(--green-primary)',
          }}>
            {isWerewolfWin ? 'Kemenangan Serigala' : 'Kemenangan Warga'}
          </h1>
          <p className="text-sm text-muted text-center mt-sm">
            {isWerewolfWin
              ? 'Faksi serigala berhasil mendominasi permainan.'
              : 'Seluruh ancaman berhasil dibersihkan dari desa.'}
          </p>
        </div>

        <div className="go-roles animate-fade-in stagger-2">
          <div className="go-roles-title">Laporan Identitas Pemain</div>
          <div className="player-list">
            {state.players.map((player, i) => {
              const roleInfo = ROLE_INFO[player.role]
              return (
                <div
                  key={player.id}
                  className={`player-item animate-fade-in stagger-${Math.min(i + 1, 5)} ${!player.isAlive ? 'dead' : ''}`}
                >
                  <div className="player-avatar">
                    {player.name[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="player-name">{player.name}</div>
                    <div className={`badge badge-${roleInfo?.color}`} style={{ marginTop: 4 }}>
                      {roleInfo?.label}
                    </div>
                  </div>
                  <span className="player-status">
                    {player.isAlive ? 'Selamat' : 'Mati'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="go-actions animate-fade-in stagger-3" style={{ gap: '8px' }}>
          <button
            className="btn btn-secondary btn-lg btn-full"
            onClick={actions.leaveRoom}
            id="btn-leave-room"
          >
            Keluar
          </button>

          {isHost ? (
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={actions.resetGame}
              id="btn-play-again"
            >
              Main Lagi
            </button>
          ) : (
            <div className="text-center text-sm text-muted" style={{ 
              border: '1px dashed var(--border-subtle)', 
              borderRadius: 'var(--radius-lg)',
              padding: '16px'
            }}>
              Menunggu host memulai permainan baru...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
