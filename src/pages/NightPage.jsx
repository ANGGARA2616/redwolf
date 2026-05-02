import { useState } from 'react'
import { useGame, ROLES, PHASES } from '../context/GameContext'
import Timer from '../components/Timer'
import './NightPage.css'

export default function NightPage() {
  const { state, actions, werewolfHovers } = useGame()
  const [selected, setSelected] = useState(null)

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const alivePlayers = state.players.filter(p => p.isAlive)

  let phaseConfig = null

  if (state.phase === PHASES.NIGHT_WEREWOLF) {
    const isWerewolf = currentPlayer?.role === ROLES.WEREWOLF
    phaseConfig = {
      title: 'Malam Hari',
      subPhase: 'Giliran Serigala',
      subLabel: '🐺',
      hasAction: isWerewolf,
      actionLabel: 'Pilih korban mangsamu malam ini:',
      confirmLabel: 'Konfirmasi Target',
      confirmAction: (id) => actions.werewolfAction(id),
      skipAction: actions.skipNightAction,
      color: 'var(--red-primary)',
      waitingIcon: '🌙',
      waitingTitle: 'Serigala Sedang Berburu',
      waitingDesc: 'Tetap diam. Jangan tunjukkan reaksimu.',
      targets: alivePlayers.filter(p => p.role !== ROLES.WEREWOLF),
      selectionClass: 'selected',
      showHovers: isWerewolf, // only werewolves see real-time hover
    }
  } else if (state.phase === PHASES.NIGHT_DOKTER) {
    const isDokter = currentPlayer?.role === ROLES.DOKTER
    phaseConfig = {
      title: 'Malam Hari',
      subPhase: 'Giliran Dokter',
      subLabel: '💊',
      hasAction: isDokter,
      actionLabel: 'Pilih satu pemain untuk dilindungi:',
      confirmLabel: 'Konfirmasi Perlindungan',
      confirmAction: (id) => actions.dokterAction(id),
      skipAction: actions.skipNightAction,
      color: 'var(--green-primary)',
      waitingIcon: '🌙',
      waitingTitle: 'Dokter Sedang Beraksi',
      waitingDesc: 'Tetap tenang. Tunggu giliran berikutnya.',
      targets: alivePlayers,
      selectionClass: 'selected-green',
    }
  } else if (state.phase === PHASES.NIGHT_DETEKTIF) {
    const isDetektif = currentPlayer?.role === ROLES.DETEKTIF
    phaseConfig = {
      title: 'Malam Hari',
      subPhase: 'Giliran Detektif',
      subLabel: '🔍',
      hasAction: isDetektif,
      actionLabel: 'Pilih target untuk diselidiki:',
      confirmLabel: 'Konfirmasi Investigasi',
      confirmAction: (id) => actions.detektifAction(id),
      skipAction: actions.skipNightAction,
      color: 'var(--blue-primary)',
      waitingIcon: '🌙',
      waitingTitle: 'Detektif Sedang Menyelidiki',
      waitingDesc: 'Tetap diam. Tunggu fase berikutnya.',
      targets: alivePlayers.filter(p => p.id !== currentPlayer?.id),
      selectionClass: 'selected-blue',
    }
  }

  if (!phaseConfig) return null

  function handleConfirm() {
    if (selected) phaseConfig.confirmAction(selected)
  }

  function handleSelect(playerId) {
    setSelected(playerId)
    // Broadcast real-time hover to co-werewolves
    if (state.phase === PHASES.NIGHT_WEREWOLF) {
      actions.hoverWerewolfTarget(playerId)
    }
  }

  function handleTimeout() {
    if (phaseConfig.hasAction && selected) phaseConfig.confirmAction(selected)
    else phaseConfig.skipAction()
  }

  let timerDuration = 30
  if (state.phase === PHASES.NIGHT_WEREWOLF) timerDuration = state.timerConfig?.werewolf || 30
  if (state.phase === PHASES.NIGHT_DOKTER) timerDuration = state.timerConfig?.dokter || 7
  if (state.phase === PHASES.NIGHT_DETEKTIF) timerDuration = state.timerConfig?.detektif || 6

  return (
    <div className="page page-dark night-bg">
      {/* Starfield overlay */}
      <div className="night-stars" aria-hidden="true" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Phase label */}
        <div className="night-header animate-fade-in">
          <div className="night-phase-pill">
            <span className="night-phase-emoji">{phaseConfig.subLabel}</span>
            <span>Siklus {state.round} — {phaseConfig.subPhase}</span>
          </div>

          <Timer
            duration={timerDuration}
            onComplete={handleTimeout}
            color={phaseConfig.color}
            variant="ring"
            key={state.phase}
          />
        </div>

        {phaseConfig.hasAction ? (
          <div className="night-action animate-fade-in-up">
            <p className="night-instruction">{phaseConfig.actionLabel}</p>
            <div className="player-list">
              {phaseConfig.targets.map(player => {
                const isHoveredByOther = phaseConfig.showHovers && werewolfHovers[player.id]
                return (
                  <div
                    key={player.id}
                    className={`player-item selectable ${selected === player.id ? phaseConfig.selectionClass : ''} ${isHoveredByOther ? 'wolf-hover-target' : ''}`}
                    onClick={() => handleSelect(player.id)}
                    id={`select-player-${player.id}`}
                    style={{ position: 'relative' }}
                  >
                    <div className="player-avatar night-avatar">
                      {player.name[0].toUpperCase()}
                    </div>
                    <span className="player-name" style={{ color: '#e0e0f0' }}>{player.name}</span>
                    {selected === player.id && (
                      <span style={{ color: phaseConfig.color, fontWeight: 700, fontSize: 13 }}>
                        ✓ Dipilih
                      </span>
                    )}
                    {isHoveredByOther && (
                      <span className="wolf-claw-indicator" title={`${werewolfHovers[player.id].hovererName} memilih ini`}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'var(--red-primary)',
                          WebkitMaskImage: 'url("/ikon-cakar.png")',
                          WebkitMaskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                          WebkitMaskPosition: 'center',
                          maskImage: 'url("/ikon-cakar.png")',
                          maskSize: 'contain',
                          maskRepeat: 'no-repeat',
                          maskPosition: 'center',
                        }} />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            <button
              className="btn btn-lg btn-full mt-lg"
              style={{
                background: phaseConfig.color,
                color: '#fff',
                boxShadow: `0 4px 20px ${phaseConfig.color}66`,
                opacity: selected ? 1 : 0.45,
              }}
              onClick={handleConfirm}
              disabled={!selected}
              id="btn-night-confirm"
            >
              {phaseConfig.confirmLabel}
            </button>
          </div>
        ) : (
          <div className="night-waiting animate-fade-in-up">
            <div className="night-moon-icon">{phaseConfig.waitingIcon}</div>
            <p className="night-waiting-text">{phaseConfig.waitingTitle}</p>
            <p className="night-waiting-sub">{phaseConfig.waitingDesc}</p>
            <div className="night-waiting-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
