import { useState, useMemo } from 'react'
import { useGame } from '../context/GameContext'
import './LobbyPage.css'

const BOT_NAMES = ['Ayu', 'Bagas', 'Cici', 'Doni', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kiki', 'Lani']

// Default role config based on player count
function getDefaultConfig(playerCount) {
  return {
    werewolf: playerCount <= 6 ? 1 : 2,
    dokter: 1,
    detektif: 1,
  }
}

export default function LobbyPage() {
  const { state, actions } = useGame()
  const [view, setView] = useState('main') // 'main' | 'settings'
  const [copied, setCopied] = useState(false)

  // Seed customEnabled from server state
  const serverHasCustomTimer = state.timerConfig && (
    state.timerConfig.werewolf !== 30 ||
    state.timerConfig.dokter !== 7 ||
    state.timerConfig.detektif !== 6 ||
    state.timerConfig.discussion !== 300 ||
    state.timerConfig.voting !== 30
  )
  const serverHasCustomRole = state.roleConfig !== null

  const [customEnabled, setCustomEnabled] = useState(serverHasCustomTimer || serverHasCustomRole)
  const [roleConfig, setRoleConfig] = useState(
    state.roleConfig || { werewolf: 2, dokter: 1, detektif: 1 }
  )
  const [timerConfig, setTimerConfig] = useState(
    state.timerConfig || {
      werewolf: 30,
      dokter: 7,
      detektif: 6,
      discussion: 300,
      voting: 30
    }
  )

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isHost = currentPlayer?.isHost
  const allReady = state.players.length >= 5 && state.players.every(p => p.isReady)
  const canStart = isHost && allReady

  const playerCount = state.players.length

  // Calculate effective config (custom or default)
  const effectiveConfig = useMemo(() => {
    if (customEnabled) return roleConfig
    return getDefaultConfig(playerCount)
  }, [customEnabled, roleConfig, playerCount])

  const totalSpecial = effectiveConfig.werewolf + effectiveConfig.dokter + effectiveConfig.detektif
  const wargaCount = Math.max(0, playerCount - totalSpecial)
  const configValid = totalSpecial < playerCount && effectiveConfig.werewolf >= 1

  function copyCode() {
    navigator.clipboard?.writeText(state.roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function addBot() {
    const used = state.players.map(p => p.name)
    const available = BOT_NAMES.filter(n => !used.includes(n))
    if (available.length > 0 && state.players.length < 15) {
      actions.addBot(available[Math.floor(Math.random() * available.length)])
    }
  }

  function updateRole(role, delta) {
    setRoleConfig(prev => {
      const limits = {
        werewolf: { min: 1, max: Math.min(4, playerCount - 1) },
        dokter: { min: 0, max: 1 },
        detektif: { min: 0, max: 1 },
      }
      const limit = limits[role]
      const newVal = Math.max(limit.min, Math.min(limit.max, prev[role] + delta))
      return { ...prev, [role]: newVal }
    })
  }

  function updateTimer(phase, delta) {
    setTimerConfig(prev => {
      const limits = {
        werewolf: { min: 5, max: 120 },
        dokter: { min: 5, max: 120 },
        detektif: { min: 5, max: 120 },
        discussion: { min: 30, max: 900 },
        voting: { min: 10, max: 120 }
      }
      const limit = limits[phase]
      
      let step = delta
      if (phase === 'discussion') {
        step = delta * 30 // Diskusi naik/turun per 30 detik
      } else if (phase === 'werewolf' || phase === 'voting') {
        step = delta * 5 // Werewolf dan Voting naik/turun per 5 detik
      } else {
        step = delta * 1 // Dokter dan Detektif naik/turun per 1 detik (contoh: 7s, 6s)
      }

      const newVal = Math.max(limit.min, Math.min(limit.max, prev[phase] + step))
      return { ...prev, [phase]: newVal }
    })
  }

  function handleStartGame() {
    // Always pass timerConfig so server uses the configured durations
    if (customEnabled) {
      actions.startGame(roleConfig, timerConfig)
    } else {
      // Pass null for roleConfig (use server auto-defaults) but still pass timerConfig
      // so any previously set custom timer is also applied
      actions.startGame(null, timerConfig)
    }
  }

  function toggleCustom() {
    if (!customEnabled) {
      // Initialize with defaults for current player count
      setRoleConfig(getDefaultConfig(playerCount))
    }
    setCustomEnabled(!customEnabled)
  }

  const renderMainView = (
    <div className="page">
      <button 
        className="btn btn-ghost" 
        onClick={actions.leaveRoom}
        style={{ position: 'absolute', left: '16px', top: '16px', zIndex: 10, padding: '6px 12px', fontSize: '13px', color: 'var(--text-secondary)' }}
      >
        ← Keluar
      </button>
      <div className="bg-grid" />
      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '32px' }}>
        <div className="lobby-header animate-fade-in">
          <div className="lobby-room-code" onClick={copyCode} id="btn-copy-code" title="Klik untuk salin">
            <span className="lobby-code-label">Kode Room</span>
            <span className="lobby-code-value">{state.roomCode}</span>
            <span className="lobby-code-copy">{copied ? 'Disalin' : 'Salin Kode'}</span>
          </div>
        </div>

        <div className="lobby-info animate-fade-in stagger-1">
          <div className="lobby-count">
            <span className="lobby-count-num">{state.players.length}</span>
            <span className="lobby-count-label">/ 15 pemain</span>
          </div>
          {state.players.length < 5 && (
            <div className="lobby-warning">
              Minimal 5 pemain untuk memulai
            </div>
          )}
        </div>

        <div className="player-list lobby-player-list animate-fade-in stagger-2">
          {state.players.map((player, i) => (
            <div
              key={player.id}
              className={`player-item animate-fade-in stagger-${Math.min(i + 1, 5)}`}
            >
              <div className="player-avatar" style={{
                background: player.isReady ? 'rgba(29, 158, 117, 0.2)' : 'var(--bg-elevated)',
                color: player.isReady ? 'var(--green-glow)' : 'var(--text-secondary)',
              }}>
                {player.name[0].toUpperCase()}
              </div>
              <span className="player-name">
                {player.name}
                {player.isHost && <span className="lobby-host-badge">HOST</span>}
                {player.isBot && <span className="lobby-bot-badge">BOT</span>}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="player-status" style={{
                  color: player.isReady ? 'var(--green-primary)' : 'var(--text-tertiary)',
                }}>
                  {player.isReady ? 'Siap' : 'Menunggu'}
                </span>
                {isHost && player.id !== state.currentPlayerId && (
                  <button 
                    className="btn btn-ghost"
                    style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--red-primary)', border: '1px solid rgba(226,75,74,0.3)', borderRadius: '4px' }}
                    onClick={() => actions.kickPlayer(player.id)}
                    title="Keluarkan pemain"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Role Configuration Panel — Host Only */}
        {isHost && (
          <div className="role-config-status animate-fade-in stagger-3">
            {customEnabled ? (
              <div className="text-center text-sm text-muted">
                Mode Custom Aktif ({effectiveConfig.werewolf} Serigala, {effectiveConfig.dokter} Dokter, {effectiveConfig.detektif} Detektif)
              </div>
            ) : (
              <div className="text-center text-sm text-muted">
                Mode Otomatis Aktif
              </div>
            )}
          </div>
        )}

        <div className="lobby-actions animate-fade-in stagger-4">
          {isHost && (
            <button 
              className="btn btn-secondary btn-full"
              onClick={() => setView('settings')}
              id="btn-open-settings"
            >
              Pengaturan
            </button>
          )}
          {isHost && state.players.length < 15 && (
            <button className="btn btn-secondary btn-full" onClick={addBot} id="btn-add-bot">
              Tambah Bot
            </button>
          )}

          {isHost ? (
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={handleStartGame}
              disabled={!canStart || (customEnabled && !configValid)}
              id="btn-start-game"
            >
              {canStart ? 'Mulai Permainan' : `Menunggu ${Math.max(0, 5 - state.players.length)} pemain lagi`}
            </button>
          ) : (
            <button
              className="btn btn-green btn-lg btn-full"
              onClick={() => actions.toggleReady(state.currentPlayerId)}
              id="btn-toggle-ready"
            >
              {currentPlayer?.isReady ? 'Status Siap' : 'Siapkan Diri'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  const formatMinutes = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s > 0 ? s + 's' : ''}`
  }

  const renderSettingsView = () => (
    <div className="page">
      <div className="bg-grid" />
      <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '32px', paddingBottom: '32px' }}>
        <button 
          className="btn-back-nav mb-md" 
          onClick={() => setView('main')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Kembali ke Lobby</span>
        </button>

        <h1 className="heading-lg mb-sm">Pengaturan Custom</h1>
        <p className="text-sm text-muted mb-lg">Atur jumlah peran dan durasi waktu setiap fase permainan.</p>

        <div className="role-config-mode mb-lg">
          <button
            className={`role-config-mode-btn ${!customEnabled ? 'active' : ''}`}
            onClick={() => setCustomEnabled(false)}
          >
            Otomatis
          </button>
          <button
            className={`role-config-mode-btn ${customEnabled ? 'active' : ''}`}
            onClick={toggleCustom}
          >
            Custom
          </button>
        </div>

        {customEnabled && (
          <>
            {/* ROLE SETTINGS */}
            <div className="settings-section mb-xl">
              <h2 className="heading-md mb-md">Jumlah Kartu</h2>
              <div className="role-config-panel">
                <div className="role-config-custom">
                  {/* Werewolf */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">🐺</span>
                      <div>
                        <span className="role-config-name">Serigala</span>
                        <span className="role-config-team team-evil">Tim Jahat</span>
                      </div>
                    </div>
                    <div className="role-config-controls">
                      <button className="role-config-btn" onClick={() => updateRole('werewolf', -1)} disabled={roleConfig.werewolf <= 1}>−</button>
                      <span className="role-config-count">{roleConfig.werewolf}</span>
                      <button className="role-config-btn" onClick={() => updateRole('werewolf', 1)} disabled={roleConfig.werewolf >= Math.min(4, playerCount - 1)}>+</button>
                    </div>
                  </div>

                  {/* Dokter */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">💊</span>
                      <div>
                        <span className="role-config-name">Dokter</span>
                        <span className="role-config-team team-good">Tim Baik</span>
                      </div>
                    </div>
                    <div className="role-config-controls">
                      <button className="role-config-btn" onClick={() => updateRole('dokter', -1)} disabled={roleConfig.dokter <= 0}>−</button>
                      <span className="role-config-count">{roleConfig.dokter}</span>
                      <button className="role-config-btn" onClick={() => updateRole('dokter', 1)} disabled={roleConfig.dokter >= 1}>+</button>
                    </div>
                  </div>

                  {/* Detektif */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">🔍</span>
                      <div>
                        <span className="role-config-name">Detektif</span>
                        <span className="role-config-team team-good">Tim Baik</span>
                      </div>
                    </div>
                    <div className="role-config-controls">
                      <button className="role-config-btn" onClick={() => updateRole('detektif', -1)} disabled={roleConfig.detektif <= 0}>−</button>
                      <span className="role-config-count">{roleConfig.detektif}</span>
                      <button className="role-config-btn" onClick={() => updateRole('detektif', 1)} disabled={roleConfig.detektif >= 1}>+</button>
                    </div>
                  </div>

                  {/* Warga */}
                  <div className="role-config-row role-config-row-auto">
                    <div className="role-config-info">
                      <span className="role-config-emoji">👤</span>
                      <div>
                        <span className="role-config-name">Warga Desa</span>
                        <span className="role-config-team team-good">Otomatis</span>
                      </div>
                    </div>
                    <div className="role-config-controls">
                      <span className="role-config-count role-config-count-auto">{wargaCount}</span>
                    </div>
                  </div>
                  {!configValid && <div className="role-config-error mt-sm">⚠ Jumlah kartu spesial melebihi jumlah pemain!</div>}
                </div>
              </div>
            </div>

            {/* TIMER SETTINGS */}
            <div className="settings-section mb-xl">
              <h2 className="heading-md mb-md">Durasi Waktu (Countdown)</h2>
              <div className="role-config-panel">
                <div className="role-config-custom">
                  {/* Timer Serigala */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">⏱️</span>
                      <div>
                        <span className="role-config-name">Fase Serigala</span>
                        <span className="text-xs text-muted">Aksi malam</span>
                      </div>
                    </div>
                    <div className="role-config-controls" style={{ minWidth: '110px' }}>
                      <button className="role-config-btn" onClick={() => updateTimer('werewolf', -1)} disabled={timerConfig.werewolf <= 5}>−</button>
                      <span className="role-config-count" style={{ width: '30px' }}>{timerConfig.werewolf}s</span>
                      <button className="role-config-btn" onClick={() => updateTimer('werewolf', 1)} disabled={timerConfig.werewolf >= 120}>+</button>
                    </div>
                  </div>

                  {/* Timer Dokter */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">⏱️</span>
                      <div>
                        <span className="role-config-name">Fase Dokter</span>
                        <span className="text-xs text-muted">Aksi malam</span>
                      </div>
                    </div>
                    <div className="role-config-controls" style={{ minWidth: '110px' }}>
                      <button className="role-config-btn" onClick={() => updateTimer('dokter', -1)} disabled={timerConfig.dokter <= 5}>−</button>
                      <span className="role-config-count" style={{ width: '30px' }}>{timerConfig.dokter}s</span>
                      <button className="role-config-btn" onClick={() => updateTimer('dokter', 1)} disabled={timerConfig.dokter >= 120}>+</button>
                    </div>
                  </div>

                  {/* Timer Detektif */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">⏱️</span>
                      <div>
                        <span className="role-config-name">Fase Detektif</span>
                        <span className="text-xs text-muted">Aksi malam</span>
                      </div>
                    </div>
                    <div className="role-config-controls" style={{ minWidth: '110px' }}>
                      <button className="role-config-btn" onClick={() => updateTimer('detektif', -1)} disabled={timerConfig.detektif <= 5}>−</button>
                      <span className="role-config-count" style={{ width: '30px' }}>{timerConfig.detektif}s</span>
                      <button className="role-config-btn" onClick={() => updateTimer('detektif', 1)} disabled={timerConfig.detektif >= 120}>+</button>
                    </div>
                  </div>

                  {/* Timer Diskusi */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">⏱️</span>
                      <div>
                        <span className="role-config-name">Fase Diskusi</span>
                        <span className="text-xs text-muted">Pagi hari</span>
                      </div>
                    </div>
                    <div className="role-config-controls" style={{ minWidth: '110px' }}>
                      <button className="role-config-btn" onClick={() => updateTimer('discussion', -1)} disabled={timerConfig.discussion <= 30}>−</button>
                      <span className="role-config-count" style={{ width: '40px', fontSize: '13px' }}>{formatMinutes(timerConfig.discussion)}</span>
                      <button className="role-config-btn" onClick={() => updateTimer('discussion', 1)} disabled={timerConfig.discussion >= 900}>+</button>
                    </div>
                  </div>

                  {/* Timer Voting */}
                  <div className="role-config-row">
                    <div className="role-config-info">
                      <span className="role-config-emoji">⏱️</span>
                      <div>
                        <span className="role-config-name">Fase Voting</span>
                        <span className="text-xs text-muted">Siang hari</span>
                      </div>
                    </div>
                    <div className="role-config-controls" style={{ minWidth: '110px' }}>
                      <button className="role-config-btn" onClick={() => updateTimer('voting', -1)} disabled={timerConfig.voting <= 10}>−</button>
                      <span className="role-config-count" style={{ width: '30px' }}>{timerConfig.voting}s</span>
                      <button className="role-config-btn" onClick={() => updateTimer('voting', 1)} disabled={timerConfig.voting >= 120}>+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <button 
          className="btn btn-primary btn-lg btn-full" 
          onClick={() => {
            // Sync settings to server immediately so they persist
            if (customEnabled) {
              actions.updateConfig(roleConfig, timerConfig)
            } else {
              actions.updateConfig(null, timerConfig)
            }
            setView('main')
          }}
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  )

  return view === 'settings' ? renderSettingsView() : renderMainView
}
