# PRODUCT REQUIREMENTS DOCUMENT
**Redwolf Online**
*Game Social Deduction Berbasis Website*

| Atribut | Detail |
| :--- | :--- |
| Versi Dokumen | 1.0 |
| Tanggal | April 2026 |
| Status | Draft — Siap Dikerjakan |
| Platform Target | Website (Mobile-first) |
| Tipe Game | Social Deduction, Multiplayer, Party Game |
| Jumlah Pemain | 5 – 15 orang |

## 1. Latar Belakang & Tujuan Produk
Werewolf (juga dikenal sebagai Mafia) adalah game social deduction yang sangat populer dimainkan secara offline. Permasalahan utama dalam bermain Werewolf konvensional adalah kebutuhan akan satu orang yang bersedia menjadi Wasit atau Host — peran yang merepotkan karena harus hafal aturan, mengatur fase malam, dan memimpin jalannya permainan.

Produk ini hadir sebagai solusi: sebuah website yang sepenuhnya menggantikan peran Wasit. Pemain tetap berkomunikasi secara offline (tatap muka), namun semua mekanisme permainan dikelola otomatis oleh sistem — mulai dari distribusi peran rahasia, fase malam, hingga penghitungan suara voting.

### 1.1 Tujuan Produk
- Menghilangkan kebutuhan wasit atau host manusia dalam permainan Werewolf.
- Menjamin kerahasiaan peran setiap pemain selama permainan berlangsung.
- Menyediakan pengalaman bermain yang adil, otomatis, dan bebas manipulasi.
- Mudah digunakan oleh siapa saja tanpa perlu membaca aturan panjang.

### 1.2 Target Pengguna
- Kelompok teman atau keluarga yang ingin bermain party game saat berkumpul.
- Komunitas, acara gathering, icebreaker kantor, atau kegiatan kampus.
- Pengguna berusia 13 tahun ke atas dengan akses smartphone dan WiFi/hotspot.

## 2. Konsep & Mekanisme Game
### 2.1 Gambaran Umum
Pemain berkumpul secara fisik di satu tempat. Setiap pemain memegang smartphone masing-masing yang terhubung ke website yang sama melalui kode room. Website bertindak sebagai Game Master otomatis yang mengatur seluruh alur permainan.

### 2.2 Peran Pemain (Versi MVP)
| Peran | Tim | Jumlah | Kemampuan Malam |
| :--- | :--- | :--- | :--- |
| Werewolf (Serigala) | Jahat | 1-3 orang (otomatis) | Pilih 1 pemain sebagai korban |
| Dokter | Baik | 1 orang | Selamatkan 1 pemain dari serangan werewolf |
| Detektif | Baik | 1 orang | Cek identitas 1 pemain (Werewolf / Bukan) |
| Warga Desa | Baik | Sisa pemain | Tidak ada aksi malam, hanya bisa voting |

Jumlah werewolf ditentukan otomatis oleh sistem berdasarkan total pemain (sekitar 1 werewolf per 4 pemain).

### 2.3 Alur Permainan

**Fase 1: Lobby & Join Room**
- Salah satu pemain membuat room dan mendapatkan kode unik (contoh: WOLF-42).
- Pemain lain buka website dan masukkan kode room untuk bergabung.
- Setiap pemain memasukkan nama panggilan.
- Setelah semua pemain siap dan menekan tombol Siap, host dapat memulai game.

**Fase 2: Distribusi Peran**
- Website mengacak dan membagikan peran secara otomatis.
- Setiap pemain membuka HP masing-masing secara diam-diam untuk melihat perannya.
- Layar HP langsung beralih ke mode gelap setelah pemain menekan tombol Paham.
- Tidak ada pemain lain yang mengetahui peran siapapun pada tahap ini.

**Fase 3: Malam Hari (berulang tiap ronde)**
Mekanisme kunci pada fase ini adalah: SEMUA layar HP aktif secara bersamaan, namun isi layarnya berbeda sesuai peran masing-masing pemain. Tidak ada notifikasi suara. Tidak ada yang perlu menutup mata.

Urutan aksi malam (semua layar aktif serentak per sub-fase):
- **Sub-fase Werewolf**: Werewolf melihat daftar pemain dan memilih korban. Pemain lain melihat layar tunggu.
- **Sub-fase Dokter**: Dokter memilih pemain yang ingin diselamatkan. Pemain lain melihat layar tunggu.
- **Sub-fase Detektif**: Detektif memilih pemain untuk diselidiki dan mendapat hasilnya. Pemain lain melihat layar tunggu.

Setiap sub-fase memiliki timer yang sama untuk semua pemain (default 20 detik), sehingga durasi tiap orang memegang HP identik dan tidak dapat dijadikan petunjuk peran.

**Fase 4: Pagi Hari**
- Website mengumumkan siapa yang menjadi korban malam itu (atau 'Tidak ada korban' jika diselamatkan Dokter).
- Pemain yang menjadi korban dieliminasi dan dapat melihat sisa permainan sebagai penonton.
- Detektif mendapat hasil penyelidikan hanya di layar HP-nya sendiri secara rahasia.

**Fase 5: Diskusi**
- Timer diskusi berjalan (default 3 menit, dapat dikustomisasi saat setup).
- Semua pemain bebas berbicara, berdebat, dan saling tuduh secara langsung (komunikasi offline).
- Website hanya menampilkan timer dan daftar pemain yang masih hidup.

**Fase 6: Voting**
- Semua pemain memilih satu nama untuk dieliminasi melalui HP masing-masing.
- Pilihan tidak terlihat oleh pemain lain sampai semua sudah submit.
- Website menghitung suara dan mengumumkan siapa yang dieliminasi beserta grafik perolehan suara.
- Identitas pemain yang dieliminasi langsung terungkap ke semua pemain.

**Kondisi Menang**
- Tim Warga menang jika semua Werewolf berhasil dieliminasi.
- Tim Werewolf menang jika jumlah Werewolf sama dengan atau lebih dari jumlah Warga yang tersisa.

## 3. Sistem Keamanan & Anti-Curang
### 3.1 Privasi Fase Malam
| Risiko | Solusi |
| :--- | :--- |
| Notif HP berbunyi memberi tahu peran orang | Tidak ada notifikasi — semua layar aktif bersamaan secara silent |
| Lama/cepat tap mengindikasikan peran | Timer identik untuk semua pemain (layar tetap terbuka sampai waktu habis) |
| Ngintip layar HP tetangga | Mode gelap otomatis saat malam, brightness diturunkan, background hitam |
| Pemain tidak mau tap sehingga terlihat | Semua pemain wajib tap (non-aktif juga dapat layar tap) |

### 3.2 Privasi Voting
- Semua pilihan voting baru terlihat setelah seluruh pemain submit.
- Jika ada pemain yang tidak submit dalam waktu tertentu, sistem auto-submit pilihan acak.

## 4. Spesifikasi Fitur (MVP)
### 4.1 Fitur Wajib (Must Have)
- Sistem room dengan kode unik yang dapat dibagikan.
- Input nama pemain tanpa perlu registrasi atau login akun.
- Distribribusi peran otomatis dan acak berbasis jumlah pemain.
- Fase malam dengan sub-giliran per peran (Werewolf, Dokter, Detektif).
- Layar berbeda per pemain berdasarkan peran, dengan timer identik.
- Mode layar gelap otomatis saat fase malam.
- Pengumuman hasil malam (korban / aman).
- Timer diskusi yang terlihat di semua HP.
- Sistem voting bersamaan tanpa terlihat real-time.
- Deteksi kondisi menang otomatis.
- Pengungkapan identitas pemain saat dieliminasi.
- Layar Game Over dengan rekap permainan.

### 4.2 Fitur Opsional (Nice to Have — Post-MVP)
- Sound effect otomatis (musik malam, ayam berkokok pagi) via speaker perangkat host.
- Pilihan paket peran: Classic, Advanced, Custom.
- Tambahan peran: Witch, Penyihir, Pemburu, Bodyguard.
- Log kejadian per ronde (siapa mati di malam ke berapa).
- Pengaturan durasi timer (malam dan diskusi) oleh host.
- Fitur Rematch dengan pemain yang sama.
- Tampilan layar besar untuk diproyeksikan (TV/proyektor mode).
- Statistik permainan (win rate per peran, rata-rata ronde).

## 5. Arsitektur Teknis
### 5.1 Stack Teknologi yang Direkomendasikan
| Layer | Teknologi | Alasan |
| :--- | :--- | :--- |
| Frontend | React.js / Next.js | Component-based, mudah manage state per player |
| Real-time | Socket.io (WebSocket) | Sync state antar HP secara real-time |
| Backend | Node.js + Express | Compatible dengan Socket.io, ringan |
| Database | Redis (session) + MongoDB (log) | Redis untuk game state cepat, Mongo untuk log |
| Hosting | Vercel / Railway / Render | Deploy mudah, gratis tier tersedia |

### 5.2 Arsitektur Sistem
Setiap HP pemain terhubung ke server melalui WebSocket. Server menyimpan game state (peran, fase, korban, voting) dan mendistribusikan informasi yang berbeda ke tiap koneksi sesuai peran pemain. Tidak ada data peran yang dikirim ke HP pemain lain.

### 5.3 Model Data Utama
| Entitas | Field Utama |
| :--- | :--- |
| Room | `roomCode`, `hostId`, `players[]`, `gameState`, `phase`, `round`, `createdAt` |
| Player | `playerId`, `name`, `role`, `isAlive`, `socketId`, `hasActed` |
| GameState | `phase`, `round`, `victims[]`, `savedBy`, `investigatedBy`, `votes{}` |

## 6. Panduan UX & UI
### 6.1 Prinsip Desain
- **Mobile-first**: semua interaksi dirancang untuk layar smartphone (360px ke atas).
- **Minimal teks**: instruksi singkat dan jelas, tidak perlu membaca panjang.
- **Feedback visual jelas**: setiap tap/aksi memberikan respons visual instan.
- **Mode gelap**: diaktifkan otomatis saat fase malam untuk menjaga privasi layar.

### 6.2 Alur Layar Utama
| Layar | Deskripsi |
| :--- | :--- |
| Home | Tombol Buat Room dan Join Room, input nama pemain |
| Lobby | Daftar pemain yang bergabung, tombol Siap, kode room yang bisa disalin |
| Layar Peran | Mode gelap, tampil peran + deskripsi singkat, tombol Paham |
| Layar Malam | Mode gelap, instruksi aksi (pilih korban / tunggu), countdown timer |
| Layar Pagi | Pengumuman korban, status pemain, tombol lanjut ke diskusi |
| Layar Diskusi | Timer besar, daftar pemain hidup, countdown |
| Layar Voting | Daftar nama pemain, pilih satu, tombol Submit |
| Hasil Voting | Bar chart perolehan suara, nama yang dieliminasi, peran terungkap |
| Game Over | Tim pemenang, rekap semua peran, tombol Main Lagi |

## 7. Onboarding Pemain
Sebelum game dimulai, website menampilkan layar onboarding singkat (bisa di-skip) berisi 3 aturan utama:
- Pegang HP menghadap ke diri sendiri — jangan tampilkan layar ke orang lain.
- Selalu tap HP saat malam hari, meskipun kamu tidak mendapat giliran aksi.
- Komunikasi dan diskusi dilakukan secara langsung, bukan lewat website.

## 8. Scope & Batasan MVP
### 8.1 Yang Termasuk dalam MVP
- 5 peran dasar: Werewolf, Dokter, Detektif, Warga (tanpa peran tambahan).
- 1 server game per room, maksimum 15 pemain per room.
- Tidak ada akun atau sistem login — cukup nama pemain.
- Session game tidak persistent (jika browser ditutup, pemain perlu rejoin dengan kode room).

### 8.2 Yang Tidak Termasuk dalam MVP
- Fitur chat teks di dalam website (komunikasi tetap offline).
- Mode bermain melawan AI.
- Dukungan multi-bahasa (MVP hanya Bahasa Indonesia).
- Sistem akun, leaderboard, atau statistik jangka panjang.

## 9. Metrik Keberhasilan
| Metrik | Target MVP |
| :--- | :--- |
| Waktu setup room hingga game mulai | < 2 menit |
| Error sync antar pemain dalam 1 ronde | 0 error kritis |
| Latency WebSocket | < 300ms |
| Pemain dapat memahami cara main tanpa penjelasan tambahan | > 80% |
| Game selesai tanpa crash/disconnect paksa | > 95% sesi |

## 10. Risiko & Mitigasi
| Risiko | Dampak | Mitigasi |
| :--- | :--- | :--- |
| Koneksi internet tidak stabil | Game terputus di tengah jalan | Auto-reconnect WebSocket + simpan state di server selama 10 menit |
| Pemain ngintip layar orang lain | Peran terbocor | Mode gelap otomatis + timer identik + edukasi onboarding |
| Pemain tidak tap HP saat malam | Game stuck menunggu | Auto-timeout: jika tidak ada aksi dalam 30 detik, sistem pilih acak (untuk non-aktif peran) |
| Room code bentrok | 2 game masuk room yang sama | Kode room 6 karakter alfanumerik acak (36^6 kemungkinan) |

## 11. Rencana Pengembangan
| Tahap | Scope | Estimasi |
| :--- | :--- | :--- |
| Tahap 1 — Foundation | Sistem room, join, distribusi peran, WebSocket basic | Sprint 1-2 |
| Tahap 2 — Game Loop | Fase malam (semua peran), fase pagi, pengumuman | Sprint 3-4 |
| Tahap 3 — Siang | Timer diskusi, sistem voting, deteksi kondisi menang | Sprint 5 |
| Tahap 4 — Polish | UI/UX, mode gelap, onboarding, edge cases | Sprint 6 |
| Tahap 5 — Post-MVP | Sound effect, peran tambahan, fitur opsional | Setelah launch |

---
*Akhir Dokumen*
PRD ini disusun berdasarkan sesi brainstorming dan siap digunakan sebagai acuan pengembangan oleh AI agent.
