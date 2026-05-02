import { useState } from 'react'
import { useGame } from '../context/GameContext'
import './HomePage.css'
import logoUrl from '../assets/logo-redwolf-v2.svg?v=7'

const BOT_NAMES = ['Ayu', 'Bagas', 'Cici', 'Doni', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Indah', 'Joko', 'Kiki', 'Lani', 'Mega', 'Nanda']

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

  if (view === 'create') {
    return (
      <div className="page">
        <div className="bg-grid" />
        <div className="bg-radial" />
        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn-back-nav mb-lg" onClick={() => setView('main')} id="btn-back-create">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Kembali</span>
          </button>
          <h1 className="heading-lg mb-md">Buat Room Baru</h1>
          <p className="text-sm text-muted mb-lg">
            Masukkan nama panggilan, lalu undang pemain untuk bergabung.
          </p>

          <div className="input-group mb-lg">
            <label className="input-label" htmlFor="input-name-create">Nama Panggilan</label>
            <input
              id="input-name-create"
              className="input-field"
              type="text"
              placeholder="Contoh: Budi"
              maxLength={15}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleCreate}
            disabled={!name.trim()}
            id="btn-create-room"
          >
            Buat Room
          </button>
        </div>
      </div>
    )
  }

  if (view === 'join') {
    return (
      <div className="page">
        <div className="bg-grid" />
        <div className="bg-radial" />
        <div className="container animate-fade-in" style={{ position: 'relative', zIndex: 1 }}>
          <button className="btn-back-nav mb-lg" onClick={() => setView('main')} id="btn-back-join">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Kembali</span>
          </button>
          <h1 className="heading-lg mb-md">Gabung Room</h1>
          <p className="text-sm text-muted mb-lg">
            Masukkan kode room dan nama panggilan Anda.
          </p>

          <div className="input-group mb-md">
            <label className="input-label" htmlFor="input-room-code">Kode Room</label>
            <input
              id="input-room-code"
              className="input-field input-code"
              type="text"
              placeholder="WOLF-XX"
              maxLength={7}
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              autoFocus
            />
          </div>

          <div className="input-group mb-lg">
            <label className="input-label" htmlFor="input-name-join">Nama Panggilan</label>
            <input
              id="input-name-join"
              className="input-field"
              type="text"
              placeholder="Contoh: Ani"
              maxLength={15}
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleJoin}
            disabled={!name.trim() || !roomCode.trim()}
            id="btn-join-room"
          >
            Gabung
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page home-page">
      <div className="bg-grid" />
      <div className="bg-radial" />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="home-hero animate-fade-in-up">
          <div className="home-logo animate-float" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '0.5rem' }}>
            <img src={logoUrl} alt="Redwolf Logo v2" style={{ width: '280px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <h1 className="heading-xl text-center" style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{ color: 'var(--red-primary)' }}>Red</span>
            <span style={{ color: 'var(--text-primary)' }}>Wolf</span>
          </h1>
          <p className="home-subtitle">Online Game</p>
          <p className="text-sm text-muted text-center mt-sm">
            Platform permainan social deduction modern tanpa memerlukan Game Master manusia.
          </p>
        </div>

        <div className="home-actions animate-fade-in stagger-2">
          <button className="btn btn-primary btn-lg btn-full" onClick={() => setView('create')} id="btn-goto-create">
            Buat Room
          </button>
          <button className="btn btn-secondary btn-lg btn-full" onClick={() => setView('join')} id="btn-goto-join">
            Gabung Room
          </button>
        </div>

        <div className="home-features animate-fade-in stagger-3">
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            </div>
            <div>
              <div className="feature-title">Akses Instan</div>
              <div className="feature-desc">Berjalan langsung pada peramban web modern</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div className="feature-title">Keamanan Sesi</div>
              <div className="feature-desc">State permainan bersifat private per pemain</div>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <div className="feature-title">Multiplayer</div>
              <div className="feature-desc">Mendukung kapasitas 5 hingga 15 pemain</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
