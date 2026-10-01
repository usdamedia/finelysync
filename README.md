# FinelySync — Family Finance

Aplikasi kewangan keluarga: rekod pendapatan & komitmen, multi-wallet, sinking fund, analisis
trend, dan sync dengan pasangan.

## Stack

- **React 18 + TypeScript**
- **Vite 6** (dev & build)
- **Firebase** (Auth + Firestore, `firebase/compat`)
- **Tailwind CSS** (CDN Play, dikonfigurasi melalui `index.html`)
- **Recharts** (carta), **Lucide** (ikon), **Motion** (animasi)
- **Capacitor** (Android/iOS), **Express** (`server.js`) untuk dev/preview, **Vercel** untuk deploy

## Jalankan secara lokal

**Prasyarat:** Node.js 20.x

1. Pasang dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` → `.env` dan isi nilai Firebase (`VITE_FIREBASE_*`).
3. Jalankan:
   ```bash
   npm run dev
   ```
   Aplikasi berjalan di http://localhost:3000 (Express + Vite middleware).

## Skrip

| Skrip | Fungsi |
|---|---|
| `npm run dev` / `npm start` | Dev server (Express + Vite middleware) |
| `npm run build` | Typecheck (`tsc`) + build produksi ke `dist/` |
| `npm run preview` | Pratonton build Vite |
| `npm run lint` | Typecheck (`tsc --noEmit`) |
| `npm run cap:sync` | Build + sync Capacitor |
| `npm run android:open` / `ios:open` | Buka projek native |

## Struktur

```
App.tsx                     # Auth gate, data Firestore, routing tab, layout shell
components/
  ui/                       # Design-system primitives (Button, Card, Input, Modal, Toast, ...)
  layout/AppShell.tsx       # Sidebar (desktop/tablet) + bottom tabs (mobile)
  popups/                   # FoundingMember, InstallPrompt, WhatsNew
  <feature components>      # Summary, CategoryList, CustomSelect, modal kalkulator, dll.
pages/
  Home, Planner, Dashboard, Profile, Auth, SinkingFund, Preferences, ...
services/                   # firebase, accountService, planningService
constants/translations.ts   # i18n (ms/en/zh/ta)
```

## Design System

Token tunggal dalam `index.html` (CSS variables + Tailwind config):

- **Warna:** neutral + primary (themeable) + semantik (success/warning/error/info).
- **Tipografi HIG:** `type-large-title` … `type-caption` (alias `text-ios-*` dikekalkan).
- **Elevation:** `shadow-elevation-1/2/3` (var `--shadow-1/2/3`).
- **Radius:** xs 6 / sm 8 / md 12 / lg 16 / xl 20 / 2xl 24.
- **Motion:** 180ms, `ease-out`; hormati `prefers-reduced-motion`.
- **Breakpoints:** xs 375 / sm 640 / md 768 / lg 1024 / xl 1280.

### Apple HIG Materials

Mengikut [Apple HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials):

- **Standard materials (content layer):** `material-ultra-thin`, `material-thin`, `material-regular`,
  `material-thick`, `material-ultra-thick`.
- **Bar material (functional layer / Liquid Glass):** `material-bar` — sidebar, tab bar, sheet.
- **Vibrancy:** `vibrant-label`, `vibrant-secondary`, `vibrant-tertiary`, `vibrant-quaternary`,
  `vibrant-fill`, `vibrant-secondary-fill`, `vibrant-tertiary-fill`, `vibrant-separator`.
- **Dimming:** `material-scrim` (35% untuk clear material di atas latar terang).
- **Depth:** `material-edge` (highlight halus di tepi atas), `material-divider-r/l/t/b`.
- **Aksesibiliti:** `prefers-reduced-transparency: reduce` → material jadi legap; `prefers-contrast: more`
  → kontras dinaikkan. Ambient backdrop (`.app-ambient`) memberi material sesuatu untuk di-blur.

Layout: **sidebar** pada ≥1024px, **bottom tabs + FAB** pada mobile, **sheet** dari bawah pada
mobile dan dialog di desktop.

## Ciri

- Multi-wallet + pindahan dana antara wallet.
- Planner: pendapatan & komitmen, carian/penapis, paparan senarai & kalendar, status bayaran.
- Belanjawan bulanan per kategori dengan amaran melebihi had.
- Komitmen & pendapatan berulang (auto-populate bulan hadapan).
- Sinking fund, analisis trend, settlement pasangan.
- Langganan (Subscription): orbit visual, kos bulanan/tahunan, peringatan pembaharuan, integrasi Planner.
- Undo (batal padam) melalui toast.
- Mod gelap: **Cahaya** / **Gelap** (OLED, hampir hitam) / **Kelabu** (Material UI) / **Auto** (ikut sistem).

## Deploy

- **Vercel:** `vercel.json` menulis semula semua laluan ke `index.html` (SPA). `npm run deploy`.
- **Mobile:** `npm run cap:sync` kemudian buka projek native.

## Nota

- Jangan commit `.env` — hanya `.env.example`.
- Logik data (recurring expenses, family sync, sinking fund) bergantung pada skema Firestore
  (`users/{uid}/settings/preferences`, `users/{uid}/monthly_data/{YYYY-MM}`, `accounts`, `transfers`,
  `invitations`). Elakkan mengubah format tanpa migrasi.
