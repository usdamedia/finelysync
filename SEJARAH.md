# Sejarah Aplikasi FinelySync

Kronologi kemaskini, ciri baharu dan penambahbaikan. Terbaharu di atas.

---

## 1 Oktober 2026 — Halaman Langganan (Subscription)

Halaman baharu untuk menambah dan mengurus semua langganan berulang.

- **Tambah/urus langganan:** nama, tarikh mula, harga, kekerapan (bulanan/tahunan), warna, pautan wallet (pilihan).
- **Kiraan kos:** bulanan → anggaran tahunan (×12); tahunan → kos tahunan sebenar (tanpa darab).
- **Visual orbit:** planet disusun pada dua orbit; saiz bulatan ∝ kos bulanan (lebih mahal = lebih besar). Teras di tengah menunjukkan jumlah sebulan & setahun.
- **Senarai terperinci:** kos sebulan, kos setahun, tarikh pembaharuan seterusnya; edit & padam (dengan undo).
- **Integrasi Planner:** kad "Langganan bulan ini" + tanda pada kalendar komitmen (`renewalDays`).
- **Peringatan:** 7 hari di halaman Langganan, 3 hari di Utama (`upcomingRenewals`).
- **Akses:** kad "Langganan" di Utama + baris dalam Profil.
- **Data:** koleksi Firestore `users/{uid}/subscriptions` melalui `services/subscriptionService.ts`.
- **Jenis baharu:** `Subscription`, `BillingCycle`; kategori perbelanjaan `Langganan`.

---

## 1 Oktober 2026 — Apple HIG Materials & Ciri Baharu

### Materials (Apple Human Interface Guidelines)
Mengikut [HIG — Materials](https://developer.apple.com/design/human-interface-guidelines/materials):

- **Standard materials (content layer):** `material-ultra-thin`, `material-thin`, `material-regular`,
  `material-thick`, `material-ultra-thick`.
- **Bar material (functional layer / Liquid Glass):** `material-bar` — sidebar, tab bar, sheet.
- **Vibrancy:** `vibrant-label/secondary/tertiary/quaternary`, `vibrant-fill/secondary-fill/tertiary-fill`,
  `vibrant-separator` untuk kekalkan kebolehbacaan teks di atas material.
- **Dimming:** `material-scrim` (35% untuk material jernih di atas latar terang).
- **Kedalaman:** `material-edge` (highlight tepi atas), `material-divider-r/l/t/b`.
- **Aksesibiliti:** `prefers-reduced-transparency: reduce` → material jadi legap; `prefers-contrast: more`
  → kontras dinaikkan. `.app-ambient` memberi material latar untuk di-blur.
- Diaplikasikan pada: sidebar, bottom tab bar, sheet/modal, toast, popover CustomSelect, segmented control.

### Ciri baharu
1. **Belanjawan bulanan per kategori** — had + progres + amaran melebihi had.
2. **Pendapatan berulang** — auto-populate ke bulan hadapan.
3. **Carian & penapis** — ikut teks, status (menunggu/selesai/asing tepi), pemilik (suami/isteri).
4. **Pindah dana antara wallet** — modal dari halaman utama + rekod transaksi.
5. **Undo padam** — toast dengan butang "Batal".
6. **Dua mod gelap + Auto** — Cahaya, **Gelap** (OLED, hampir hitam `#0B0B0F`), **Kelabu** (Material UI, `#121212`/`#1E1E1E`), dan **Auto** (ikut sistem). Pemilih penampilan berbentuk kad dengan pratonton.
7. **Kalendar komitmen** — paparan bulanan ikut tarikh bayaran; medan `dueDay` (1-31) ditambah pada komitmen.

### Model data
- `IncomeItem`: `isRecurring`, `recurringSourceId`.
- `Expense`: `dueDay`.
- `UserSettings`: `themeMode` ('light' | 'dark' | 'system'), `budgets` (had per kategori).

---

## 1 Oktober 2026 — Transformasi UI/UX Premium & Design System

Audit menyeluruh dan pembinaan semula lapisan visual aplikasi supaya konsisten, responsif dan
bertaraf premium pada desktop, tablet dan mobile — tanpa mengubah logik data.

### Fasa 0 — Asas reka bentuk (`index.html`)
- Token tunggal (CSS variables + Tailwind config): warna neutral + primary (themeable) + semantik
  (success/warning/error/info), elevation `--shadow-1/2/3`, radius berskala, motion 180ms.
- Skala tipografi Apple HIG: `type-large-title` … `type-caption` (alias `text-ios-*` dikekalkan).
- Membaiki **67+ kelas yang sebelum ini tidak wujud** (dirender senyap): `shadow-elevation-1/2/3`,
  `primaryContainer`/`onPrimaryContainer`, `secondaryContainer`, `tertiaryContainer`,
  `custom-scrollbar`, `no-scrollbar`, `animate-spin-slow`, `animate-pulse-slow`.
- Buang `transition: 400ms` global → transisi berskop 180ms.
- `prefers-reduced-motion`, `:focus-visible`, buka zoom (buang `user-scalable=no`), buang
  `overflow-x: hidden`.

### Fasa 1 — UI primitives (`components/ui/`)
- `Button`, `IconButton`, `Card`/`CardHeader`, `Input`, `Badge`, `Modal` (sheet mobile / dialog
  desktop, Esc, scroll-lock, focus), `Toast` + `useToast`, `SegmentedControl`, `Switch`,
  `EmptyState`, `Skeleton`.

### Fasa 2 — App shell (`components/layout/AppShell.tsx`)
- Sidebar kekal pada desktop/tablet (≥1024px) + bottom tab & FAB pada mobile.
- Quick-add melalui `Modal`. `App.tsx` menggunakan shell + `ToastProvider` (ganti `alert`).

### Fasa 3 — Halaman & komponen
- **Auth:** onboarding bersih, `Input`/`Button`/`Modal`, tiada warna hardcode.
- **Home:** hero bersih; QuickTools — semua 4 alat aktif (Vehicle & Duit Raya kini berfungsi);
  tutorial & kad sokongan minimal.
- **Planner:** `SegmentedControl`, grid responsif (1 kolum mobile), status button ≥36px, modal
  duplikasi; **PlannerForm** dengan progressive disclosure + `Switch`.
- **Dashboard:** carta guna token tema, gauge bersih.
- **Profile/WalletManager/FamilySync:** token, `Modal`, `Switch`, toast.
- **SinkingFund, Preferences, Language, HelpCentre, ContactUs, PrivacyPolicy, TermsOfService,
  AppHistory, DonationPage, semua kalkulator & popups:** token konsisten, tiada gradient/emoji/glass
  berlebihan.

### Fasa 4 — Kebersihan kod
- Dipadam ~2,400 baris dead code: `components/{Home,Dashboard,Planner,Auth,UserProfile,
  AccountsWidget,TransferModal,FeedbackPoll,DonationModal,SegmentedTabMenu,ActiveWalletP2PCard}.tsx`
  dan `pages/SegmentedTabExample/`.

### Fasa 5 — Prestasi & validasi
- Code-splitting (`manualChunks`) + lazy loading halaman dan modal kalkulator.
  Bundle entri utama **1.67 MB → 195 KB**.
- `tsc --noEmit` lulus, `npm run build` lulus.

### Nota
- Logik Firebase, recurring expenses, family sync, auth dan i18n **tidak diubah**.
- Skema Firestore dikekalkan: `users/{uid}/settings/preferences`,
  `users/{uid}/monthly_data/{YYYY-MM}`, `accounts`, `transfers`, `invitations`.

---

## 4 April 2026 — Apa Yang Baharu
- Wallet konsisten (paparan "Wallet Aktif" berbentuk rectangle tetap).
- Dropdown premium (menu pilihan wallet lebih jelas, kontras putih-hitam).
- Kad wallet moden dengan ikon dan fungsi sorok/papar baki.
- Optimasi desktop (responsiveness lebih seimbang).
- Ketepatan baki diselaraskan (kad wallet vs Total Balance).
- Butang "Save" pada kemas kini Display Name di Preferences.
- Pembaikan bug: komitmen berulang dan duplicate rekod ke bulan lain.
- Onboarding baharu: "4 Sebab Utama" pada halaman Login.
- Keseragaman branding dan penambahbaikan terjemahan (ms/en/zh/ta).

## 22 Januari 2026 — Pelancaran Fungsi Penuh (Multi-Wallet & Sinking Fund)
- Status wallet berbilang tersedia sepenuhnya (Initial Value per wallet).
- Paparan dinamik: wallet spesifik vs Global Wealth.
- Pengurusan komitmen per wallet.
- Sinking Fund: auto-kira komitmen bulanan dan paparan halaman khusus.

## 14 Januari 2026 — Migrasi Data & Rekod
- Sistem migrasi data versi lama ke sistem multi-wallet.
- Sejarah Sinking Fund.

## 12 Januari 2026 — Logik Sistem, Struktur Data & Integrasi Sinking Fund
- Ikon mini Sinking Fund; persistensi pilihan wallet; popup pengguna baharu; Global View.
- Tetapan perkongsian wallet dengan pasangan.
- Automatik refleksi Sinking Fund ke bulan hadapan.

## 5 Januari 2026 — Visualisasi Data & Analisis
- Tolok visual (semi-circle gauge) dan carta bar pendapatan/perbelanjaan.

## 4 Januari 2026 — Ciri Baharu & Penambahbaikan UI
- Sistem wallet dengan komitmen masing-masing.
- Kalkulator persaraan dan kos sebenar kereta & insurans.
- Result card berbentuk wallet, dropdown native, butang Add Wallet, Dark Mode.

## 25 Disember 2025 — Permintaan Ciri Daripada Pengguna
- Cadangan multi-wallet (dompet, bank personal, bank bisnes, bank gaji).
- Kebolehan memindahkan dana antara akaun.
