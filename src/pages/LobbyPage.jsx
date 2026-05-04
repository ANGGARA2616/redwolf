import { useState, useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { NightSilhouette } from '../components/Silhouette'
import './LobbyPage.css'

const BOT_NAMES = ['Ayu', 'Bagas', 'Cici', 'Doni', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kiki', 'Lani']

function getDefaultConfig(playerCount) {
  return {
    werewolf: playerCount <= 6 ? 1 : 2,
    dokter: 1,
    detektif: 1,
  }
}

// ── SVG Icons ──────────────────────────────────────────────────────────────
const IconLeave = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)
const IconBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)
const IconCopy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
)
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconBot = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <path d="M12 11V7"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M8 15h.01M16 15h.01"/>
  </svg>
)
const IconPlay = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconKick = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconWolf = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2l2 4-3 3 3 1-1 4 4-2 3 3 3-3 4 2-1-4 3-1-3-3 2-4-4 2z"/>
  </svg>
)
const IconDoctor = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
)
const IconDetective = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

export default function LobbyPage() {
  const { state, actions } = useGame()
  const [view, setView] = useState('main')
  const [copied, setCopied] = useState(false)

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
    state.timerConfig || { werewolf: 30, dokter: 7, detektif: 6, discussion: 300, voting: 30 }
  )

  const currentPlayer = state.players.find(p => p.id === state.currentPlayerId)
  const isHost = currentPlayer?.isHost
  const allReady = state.players.length >= 5 && state.players.every(p => p.isReady)
  const canStart = isHost && allReady
  const playerCount = state.players.length

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
      if (phase === 'discussion') step = delta * 30
      else if (phase === 'werewolf' || phase === 'voting') step = delta * 5
      const newVal = Math.max(limit.min, Math.min(limit.max, prev[phase] + step))
      return { ...prev, [phase]: newVal }
    })
  }

  function handleStartGame() {
    if (customEnabled) {
      actions.startGame(roleConfig, timerConfig)
    } else {
      actions.startGame(null, timerConfig)
    }
  }

  function toggleCustom() {
    if (!customEnabled) setRoleConfig(getDefaultConfig(playerCount))
    setCustomEnabled(!customEnabled)
  }

  const formatMinutes = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s > 0 ? s + 's' : ''}`
  }

  // ── Settings View ──────────────────────────────────────────────────────────
  if (view === 'settings') {
    return (
      <div className="page lobby-page">
        <div className="home-bg-stars" aria-hidden="true" />
        <NightSilhouette />

        {/* Back button */}
        <button className="subpage-back-btn" onClick={() => setView('main')} aria-label="Kembali ke Lobby">
          <IconBack />
        </button>

        <div className="lobby-settings-wrapper">
          <div className="lobby-settings-card animate-fade-in">
            <h1 className="subpage-title" style={{ textAlign: 'left', marginBottom: '4px' }}>Pengaturan</h1>
            <p className="subpage-desc" style={{ textAlign: 'left', marginBottom: '20px' }}>Atur peran dan durasi setiap fase.</p>

            {/* Mode toggle */}
            <div className="lobby-mode-toggle">
              <button
                className={`lobby-mode-btn ${!customEnabled ? 'active' : ''}`}
                onClick={() => setCustomEnabled(false)}
              >Otomatis</button>
              <button
                className={`lobby-mode-btn ${customEnabled ? 'active' : ''}`}
                onClick={toggleCustom}
              >Custom</button>
            </div>

            {customEnabled && (
              <>
                {/* Role config */}
                <div className="lobby-settings-section">
                  <p className="lobby-settings-section-title">Jumlah Kartu</p>
                  <div className="lobby-config-list">
                    {[
                      { key: 'werewolf', label: 'Serigala', sub: 'Tim Jahat', icon: <IconWolf />, min: 1, max: Math.min(4, playerCount - 1), val: roleConfig.werewolf },
                      { key: 'dokter',   label: 'Dokter',   sub: 'Tim Baik',  icon: <IconDoctor />, min: 0, max: 1, val: roleConfig.dokter },
                      { key: 'detektif', label: 'Detektif', sub: 'Tim Baik',  icon: <IconDetective />, min: 0, max: 1, val: roleConfig.detektif },
                    ].map(r => (
                      <div key={r.key} className="lobby-config-row">
                        <div className="lobby-config-icon">{r.icon}</div>
                        <div className="lobby-config-info">
                          <span className="lobby-config-name">{r.label}</span>
                          <span className="lobby-config-sub">{r.sub}</span>
                        </div>
                        <div className="lobby-config-controls">
                          <button className="lobby-config-btn" onClick={() => updateRole(r.key, -1)} disabled={r.val <= r.min}>−</button>
                          <span className="lobby-config-val">{r.val}</span>
                          <button className="lobby-config-btn" onClick={() => updateRole(r.key, 1)} disabled={r.val >= r.max}>+</button>
                        </div>
                      </div>
                    ))}
                    {/* Warga (auto) */}
                    <div className="lobby-config-row lobby-config-row-auto">
                      <div className="lobby-config-icon"><IconUsers /></div>
                      <div className="lobby-config-info">
                        <span className="lobby-config-name">Warga Desa</span>
                        <span className="lobby-config-sub">Otomatis</span>
                      </div>
                      <div className="lobby-config-controls">
                        <span className="lobby-config-val lobby-config-val-auto">{wargaCount}</span>
                      </div>
                    </div>
                    {!configValid && (
                      <p className="lobby-config-error">Jumlah kartu spesial melebihi jumlah pemain!</p>
                    )}
                  </div>
                </div>

                {/* Timer config */}
                <div className="lobby-settings-section">
                  <p className="lobby-settings-section-title">Durasi Waktu</p>
                  <div className="lobby-config-list">
                    {[
                      { key: 'werewolf',  label: 'Fase Serigala', sub: 'Aksi malam',  icon: <IconClock />, val: timerConfig.werewolf,  fmt: v => `${v}s`,            min: 5,   max: 120 },
                      { key: 'dokter',    label: 'Fase Dokter',   sub: 'Aksi malam',  icon: <IconClock />, val: timerConfig.dokter,    fmt: v => `${v}s`,            min: 5,   max: 120 },
                      { key: 'detektif',  label: 'Fase Detektif', sub: 'Aksi malam',  icon: <IconClock />, val: timerConfig.detektif,  fmt: v => `${v}s`,            min: 5,   max: 120 },
                      { key: 'discussion',label: 'Fase Diskusi',  sub: 'Pagi hari',   icon: <IconClock />, val: timerConfig.discussion, fmt: formatMinutes,          min: 30,  max: 900 },
                      { key: 'voting',    label: 'Fase Voting',   sub: 'Siang hari',  icon: <IconClock />, val: timerConfig.voting,    fmt: v => `${v}s`,            min: 10,  max: 120 },
                    ].map(t => (
                      <div key={t.key} className="lobby-config-row">
                        <div className="lobby-config-icon">{t.icon}</div>
                        <div className="lobby-config-info">
                          <span className="lobby-config-name">{t.label}</span>
                          <span className="lobby-config-sub">{t.sub}</span>
                        </div>
                        <div className="lobby-config-controls">
                          <button className="lobby-config-btn" onClick={() => updateTimer(t.key, -1)} disabled={t.val <= t.min}>−</button>
                          <span className="lobby-config-val" style={{ minWidth: '44px', fontSize: '13px' }}>{t.fmt(t.val)}</span>
                          <button className="lobby-config-btn" onClick={() => updateTimer(t.key, 1)} disabled={t.val >= t.max}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button
              className="subpage-btn-primary"
              onClick={() => {
                if (customEnabled) actions.updateConfig(roleConfig, timerConfig)
                else actions.updateConfig(null, timerConfig)
                setView('main')
              }}
            >
              <IconCheck />
              Simpan Pengaturan
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Main Lobby View ────────────────────────────────────────────────────────
  return (
    <div className="page lobby-page">
      <div className="home-bg-stars" aria-hidden="true" />
      <NightSilhouette />

      {/* Leave button — top left */}
      <button
        className="subpage-back-btn"
        onClick={actions.leaveRoom}
        id="btn-leave-room"
        aria-label="Keluar dari room"
        title="Keluar"
      >
        <IconLeave />
      </button>

      {/* Settings button — top right (host only) */}
      {isHost && (
        <button
          className="subpage-back-btn lobby-settings-btn"
          onClick={() => setView('settings')}
          id="btn-open-settings"
          aria-label="Pengaturan"
          title="Pengaturan"
        >
          <IconSettings />
        </button>
      )}

      <div className="lobby-main-wrapper">
        {/* Room Code Card */}
        <div className="lobby-code-card animate-fade-in" onClick={copyCode} id="btn-copy-code" role="button" tabIndex={0}>
          <span className="lobby-code-label">Kode Room</span>
          <span className="lobby-code-value">{state.roomCode}</span>
          <span className="lobby-code-copy">
            {copied ? <><IconCheck /> Disalin!</> : <><IconCopy /> Salin Kode</>}
          </span>
        </div>

        {/* Player count + warning */}
        <div className="lobby-meta animate-fade-in">
          <div className="lobby-meta-count">
            <IconUsers />
            <span><strong>{state.players.length}</strong> / 15 pemain</span>
          </div>
          {state.players.length < 5 && (
            <span className="lobby-meta-warning">
              Minimal 5 pemain untuk memulai
            </span>
          )}
          {isHost && (
            customEnabled ? (
              <div className="lobby-meta-config">
                <div className="lobby-meta-chip chip-wolf">
                  <IconWolf /> {effectiveConfig.werewolf}
                </div>
                <div className="lobby-meta-chip chip-doctor">
                  <IconDoctor /> {effectiveConfig.dokter}
                </div>
                <div className="lobby-meta-chip chip-detective">
                  <IconDetective /> {effectiveConfig.detektif}
                </div>
              </div>
            ) : (
              <span className="lobby-meta-mode">Otomatis</span>
            )
          )}
        </div>

        {/* Player grid */}
        <div className="lobby-player-grid animate-fade-in">
          {state.players.map((player, i) => (
            <div
              key={player.id}
              className={[
                'lobby-player-card',
                player.isReady ? 'ready' : '',
                player.isHost  ? 'is-host' : '',
                player.isBot   ? 'is-bot'  : '',
              ].filter(Boolean).join(' ')}
            >
              {/* Kick button — corner */}
              {isHost && player.id !== state.currentPlayerId && (
                <button
                  className="lobby-kick-btn"
                  onClick={() => actions.kickPlayer(player.id)}
                  title="Keluarkan pemain"
                >
                  <IconKick />
                </button>
              )}

              <div className="lobby-card-avatar">
                {player.name[0].toUpperCase()}
              </div>
              <span className="lobby-card-name">{player.name}</span>
              <span className={`lobby-card-status ${player.isReady ? 'ready' : ''}`}>
                {player.isReady ? 'Siap' : 'Menunggu'}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="lobby-actions animate-fade-in">
          {isHost && state.players.length < 15 && (
            <button className="lobby-action-secondary" onClick={addBot} id="btn-add-bot">
              <IconBot />
              Tambah Bot
            </button>
          )}

          {isHost ? (
            <button
              className="subpage-btn-primary"
              onClick={handleStartGame}
              disabled={!canStart || (customEnabled && !configValid)}
              id="btn-start-game"
            >
              <IconPlay />
              {canStart ? 'Mulai Permainan' : `Tunggu ${Math.max(0, 5 - state.players.length)} pemain lagi`}
            </button>
          ) : (
            <button
              className={`lobby-ready-btn ${currentPlayer?.isReady ? 'ready' : ''}`}
              onClick={() => actions.toggleReady(state.currentPlayerId)}
              id="btn-toggle-ready"
            >
              {currentPlayer?.isReady ? (
                <><IconCheck /> Siap!</>
              ) : (
                'Siapkan Diri'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
