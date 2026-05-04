import { useState } from 'react'
import { useGame } from '../context/GameContext'
import { NightSilhouette } from '../components/Silhouette'
import './HomePage.css'
import logoUrl from '../assets/logo-redwolf-v3.svg'

export default function HomePage() {
  const { actions } = useGame()
  const [view, setView] = useState('main') // 'main' | 'create' | 'join'
  const [name, setName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  function handleCreate() {
    if (!name.trim()) return
    actions.createRoom(name.trim())
  }

  function handleJoin() {
    if (!name.trim() || !roomCode.trim()) return
    actions.joinRoom(name.trim(), roomCode.trim())
  }

  // ── Sub-page: Create Room ──────────────────────────────────────
  if (view === 'create') {
    return (
      <div className="page home-page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="home-bg-stars" aria-hidden="true" />
        <div className="home-moon" aria-hidden="true" />
        <NightSilhouette />

        {/* Back button — top left */}
        <button
          className="subpage-back-btn"
          onClick={() => setView('main')}
          id="btn-back-create"
          aria-label="Kembali"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        {/* Glassmorphism card */}
        <div className="subpage-wrapper">
        <div className="subpage-card animate-fade-in-up">
          {/* Icon */}
          <div className="subpage-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>

          <h1 className="subpage-title">Buat Room Baru</h1>
          <p className="subpage-desc">Kamu akan menjadi host. Bagikan kode room kepada teman-temanmu.</p>

          <div className="subpage-divider" />

          <div className="subpage-field">
            <label className="subpage-label" htmlFor="input-name-create">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Nama Panggilan
            </label>
            <input
              id="input-name-create"
              className="subpage-input"
              type="text"
              placeholder="Masukkan nama kamu..."
              maxLength={15}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <button
            className="subpage-btn-primary"
            onClick={handleCreate}
            disabled={!name.trim()}
            id="btn-create-room"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Buat Room
          </button>
        </div>
        </div>
      </div>
    )
  }

  // ── Sub-page: Join Room ────────────────────────────────────────────────
  if (view === 'join') {
    return (
      <div className="page home-page" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="home-bg-stars" aria-hidden="true" />
        <div className="home-moon" aria-hidden="true" />
        <NightSilhouette />

        <button
          className="subpage-back-btn"
          onClick={() => setView('main')}
          id="btn-back-join"
          aria-label="Kembali"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="subpage-wrapper">
        <div className="subpage-card animate-fade-in-up">
          <div className="subpage-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>

          <h1 className="subpage-title">Gabung Room</h1>
          <p className="subpage-desc">Masukkan kode room yang dibagikan oleh host permainan.</p>

          <div className="subpage-divider" />

          <div className="subpage-field">
            <label className="subpage-label" htmlFor="input-room-code">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Kode Room
            </label>
            <input
              id="input-room-code"
              className="subpage-input subpage-input-code"
              type="text"
              placeholder="WOLF-XX"
              maxLength={7}
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              autoFocus
            />
          </div>

          <div className="subpage-field">
            <label className="subpage-label" htmlFor="input-name-join">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Nama Panggilan
            </label>
            <input
              id="input-name-join"
              className="subpage-input"
              type="text"
              placeholder="Masukkan nama kamu..."
              maxLength={15}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <button
            className="subpage-btn-primary"
            onClick={handleJoin}
            disabled={!name.trim() || !roomCode.trim()}
            id="btn-join-room"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Masuk ke Room
          </button>
        </div>
        </div>
      </div>
    )
  }

  // ── Main Landing ───────────────────────────────────────────────────────
  return (
    <div className="page home-page">
      {/* Starfield */}
      <div className="home-bg-stars" aria-hidden="true" />



      {/* Moon glow */}
      <div className="home-moon" aria-hidden="true" />

      {/* Village silhouette */}
      <NightSilhouette />

      <div className="container home-container" style={{ position: 'relative', zIndex: 2 }}>

        {/* Hero */}
        <div className="home-hero animate-fade-in-up">
          <div className="home-logo animate-float">
            <img src={logoUrl} alt="Redwolf Logo" style={{ width: '260px', height: 'auto', objectFit: 'contain' }} />
          </div>

          <h1 className="home-title">
            <span className="home-title-red">Red</span><span>Wolf</span>
          </h1>

          <p className="home-subtitle">Online · Social Deduction</p>

          <p className="home-tagline animate-fade-in stagger-1">
            Siapa yang bersembunyi di antara kita?
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="home-actions animate-fade-in stagger-2">
          <button
            className="btn home-btn-primary btn-lg btn-full"
            onClick={() => setView('create')}
            id="btn-goto-create"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Buat Room
          </button>
          <button
            className="btn home-btn-secondary btn-lg btn-full"
            onClick={() => setView('join')}
            id="btn-goto-join"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Gabung Room
          </button>
        </div>

        {/* How it works — game cycle */}
        <div className="home-flow animate-fade-in stagger-3">
          <div className="home-flow-step">
            <div className="home-flow-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </div>
            <div className="home-flow-label">Malam</div>
            <div className="home-flow-desc">Serigala memilih mangsa diam-diam</div>
          </div>

          <div className="home-flow-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div className="home-flow-step">
            <div className="home-flow-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </div>
            <div className="home-flow-label">Pagi</div>
            <div className="home-flow-desc">Korban terungkap, diskusi dimulai</div>
          </div>

          <div className="home-flow-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>

          <div className="home-flow-step">
            <div className="home-flow-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
              </svg>
            </div>
            <div className="home-flow-label">Voting</div>
            <div className="home-flow-desc">Warga mengeksekusi tersangka</div>
          </div>
        </div>

        <p className="home-footer-note animate-fade-in stagger-4">
          5–15 pemain · Tanpa Game Master · Real-time
        </p>

      </div>
    </div>
  )
}
