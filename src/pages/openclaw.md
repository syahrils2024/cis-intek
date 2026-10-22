# Openclaw Feature Plan

## Overview
Fitur Openclaw untuk mengelola **soul.md** (markdown editor) dan **WhatsApp channels** yang terhubung ke server Openclaw via API.

## Fitur Utama
1. **Soul Editor** – Edit `soul.md` menggunakan Markdown editor (preview live)
2. **WhatsApp Channel Management** – List, tambah, hapus, login/logout channel, dan tampilkan QR code

## Tech Stack
- React + Zustand (state management)
- React Router (routing)
- Axios (API calls)
- Markdown editor: `react-mde` + `showdown` atau `@uiw/react-md-editor`
- Tailwind CSS (styling)

## Struktur Folder
```
src/pages/admin/openclaw/
├── index.jsx                 # Main page (tabs: Soul, Channels)
├── components/
│   ├── SoulEditor.jsx        # Markdown editor with preview
│   ├── ChannelList.jsx       # Table of channels
│   ├── ChannelForm.jsx       # Modal/toggle form for adding channel
│   ├── QRCodeDisplay.jsx     # QR code image display
│   └── StatusBadge.jsx       # Status badge (connected, disconnected, etc.)
├── stores/
│   ├── soul.store.js         # Zustand store for soul data
│   └── channel.store.js      # Zustand store for channels
├── hooks/
│   ├── useSoul.js            # Custom hook for soul CRUD
│   └── useChannels.js        # Custom hook for channel operations
└── utils/
    └── openclaw-api.js       # API wrapper using openclawRepository
```

## Implementation Steps

### 1. Routing
Tambahkan route di `src/routes.js`:
```js
{ path: '/admin/openclaw', component: OpenclawPage, auth: true }
```

### 2. State Management
- `soul.store.js`: `content`, `loading`, `error`, `fetchSoul`, `updateSoul`
- `channel.store.js`: `channels`, `loading`, `error`, `fetchChannels`, `addChannel`, `deleteChannel`, `logoutChannel`, `startLogin`, `waitLogin`

### 3. API Integration
Gunakan `openclawRepository` yang sudah dibuat. Set token via `setAuthToken`.

### 4. UI Components
- **Tabs**: Soul | Channels
- **Soul tab**: Markdown editor (split view) dengan tombol save dan status success/error
- **Channels tab**: Table dengan kolom: Name, Workspace, Phone, Status, Actions (Logout, Delete, Login QR)
- **QR Code**: Modal atau inline display dengan polling untuk status login

### 5. Polling Logic
Untuk login WA:
1. User klik "Login" → panggil `startWhatsAppLogin({ id })` → dapat QR data URL
2. Tampilkan QR code dan mulai polling `waitWhatsAppLogin({ id, currentQrDataUrl })` setiap 2-3 detik
3. Jika `connected: true` → refresh channel list
4. Jika QR expired, polling akan mengembalikan `qrDataUrl` baru, update tampilan

## Markdown Editor Options
- **react-mde** + **showdown**: lightweight, simple
- **@uiw/react-md-editor**: feature-rich, supports preview
- Pastikan support syntax highlighting dan toolbar dasar (bold, italic, heading, list)

## Dependencies
```bash
npm install react-mde showdown @uiw/react-md-editor
# or
npm install @uiw/react-md-editor
```

## Error Handling
- Tampilkan toast notification untuk error API
- Retry logic untuk polling dengan exponential backoff
- Timeout handling untuk login WA

## Testing
- Unit test untuk stores dan hooks
- Integration test untuk API calls
- Manual testing dengan mock server atau real Openclaw backend

## Deployment
- Pastikan environment variable `VITE_API_URL` terisi
- Pastikan backend memiliki akses ke Docker socket untuk Openclaw

## Future Enhancements
- Multiple soul versions (backup)
- Scheduling soul updates
- Advanced channel analytics (message stats)

---

**Status**: Planned – ready for development.