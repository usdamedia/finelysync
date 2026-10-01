
import React from 'react';
import { ChevronLeft, Calendar, Rocket, Database, Settings, BarChart, Layout, MessageSquare, Sparkles } from 'lucide-react';

interface AppHistoryProps {
  onBack: () => void;
}

const historyData = [
  {
    date: "1 Oktober 2026",
    title: "Halaman Langganan (Subscription)",
    icon: Sparkles,
    points: [
      { label: "Tambah & Urus Langganan", desc: "Rekod nama, tarikh mula, harga, dan kekerapan pembayaran (bulanan atau tahunan)." },
      { label: "Kiraan Kos Automatik", desc: "Langganan bulanan memaparkan anggaran tahunan (×12); langganan tahunan memaparkan kos tahunan sebenar tanpa didarab." },
      { label: "Visual Orbit", desc: "Langganan dipaparkan sebagai planet pada orbit — kos bulanan lebih tinggi bermakna bulatan lebih besar. Di tengah, jumlah kos sebulan dan setahun." },
      { label: "Ringkasan & Senarai", desc: "Setiap langganan menunjukkan kos sebulan, kos setahun, dan tarikh pembaharuan seterusnya." },
      { label: "Edit & Padam", desc: "Kemas kini atau padam langganan, dengan pilihan 'Batal' (undo) selepas padam." },
      { label: "Integrasi Planner", desc: "Pembaharuan langganan muncul dalam Planner (kad 'Langganan bulan ini') dan ditandakan pada kalendar komitmen." },
      { label: "Peringatan Pembaharuan", desc: "Peringatan 7 hari di halaman Langganan dan 3 hari di halaman Utama sebelum tarikh pembaharuan." },
    ]
  },
  {
    date: "1 Oktober 2026",
    title: "Apple HIG Materials & Ciri Baharu",
    icon: Sparkles,
    points: [
      { label: "Materials (Apple HIG)", desc: "Lapisan material mengikut Human Interface Guidelines: ultra-thin, thin, regular, thick, ultra-thick, dan bar material (sidebar, tab bar, sheet, toast, popover). Termasuk vibrancy, dimming scrim, dan sokongan Reduce Transparency & Increase Contrast." },
      { label: "Belanjawan Bulanan", desc: "Tetapkan had perbelanjaan setiap kategori. Kad belanjawan memaparkan progres dan bertukar warna apabila hampir atau melebihi had." },
      { label: "Pendapatan Berulang", desc: "Tanda pendapatan tetap (gaji, elaun) untuk dipopulasi automatik ke bulan seterusnya, sama seperti komitmen berulang." },
      { label: "Carian & Penapis", desc: "Cari komitmen atau pendapatan, dan tapis mengikut status (menunggu/selesai/asing tepi) serta pemilik (suami/isteri)." },
      { label: "Pindah Dana", desc: "Pindahkan wang antara wallet terus dari halaman utama, lengkap dengan rekod transaksi." },
      { label: "Undo Padam", desc: "Padam komitmen atau pendapatan kini boleh dibatalkan melalui butang 'Batal' pada notifikasi." },
      { label: "Dua Mod Gelap", desc: "Pilihan penampilan Cahaya, Gelap (OLED hampir hitam), Kelabu (Material UI), dan Auto (ikut sistem peranti)." },
      { label: "Kalendar Komitmen", desc: "Paparan kalendar bulanan menunjukkan komitmen mengikut tarikh bayaran (hari dalam bulan)." },
      { label: "Tarikh Bayaran Komitmen", desc: "Setiap komitmen boleh diberi tarikh (1-31) untuk muncul dalam kalendar." },
    ]
  },
  {
    date: "1 Oktober 2026",
    title: "Transformasi UI/UX Premium & Design System",
    icon: Sparkles,
    points: [
      { label: "Design System Bersatu", desc: "Token tunggal untuk warna, tipografi (skala Apple HIG), elevation, radius dan motion. Semua kelas yang sebelum ini tidak berfungsi (shadow-elevation, primaryContainer, custom-scrollbar) kini berfungsi." },
      { label: "Navigasi Responsif", desc: "Sidebar kekal pada desktop/tablet (≥1024px) dan bottom tab + FAB pada mobile. Modal menjadi sheet dari bawah pada mobile dan dialog di tengah pada desktop." },
      { label: "Komponen Reusable", desc: "Primitives baharu: Button, Input, Card, Modal, Toast, Badge, SegmentedControl, Switch, EmptyState, Skeleton — ganti styling bertindih di setiap halaman." },
      { label: "Maklum Balas Lebih Baik", desc: "Sistem Toast menggantikan alert()/confirm() yang mengganggu. Loading, empty dan error state kini konsisten di seluruh aplikasi." },
      { label: "Aksesibiliti", desc: "Zoom dibuka (tidak lagi dikunci), focus-visible untuk pengguna papan kekunci, aria-label pada butang ikon, dan sokongan prefers-reduced-motion." },
      { label: "Prestasi", desc: "Code-splitting dan lazy loading: bundle entri utama turun daripada 1.67MB kepada 195KB. Carta dan halaman lain dimuat atas permintaan." },
      { label: "Kebersihan Kod", desc: "Kira-kira 2,400 baris kod lama yang tidak digunakan dibuang untuk projek yang lebih mudah diselenggara." },
      { label: "Halaman Dikemas", desc: "Auth, Home, Planner, Dashboard, Profil, Sinking Fund, Preferences dan semua modal kalkulator diselaraskan dengan bahasa reka bentuk yang sama." },
    ]
  },
  {
    date: "4 April 2026",
    title: "Apa Yang Baharu",
    icon: Rocket,
    points: [
      { label: "Wallet Konsisten", desc: "Paparan “Wallet Aktif” kini berbentuk rectangle tetap dan kemas." },
      { label: "Dropdown Premium", desc: "Menu pilihan wallet kini lebih jelas dengan tema putih-hitam yang kontras dan mudah dibaca." },
      { label: "Kad Wallet Moden", desc: "Reka bentuk kad di Home kini lebih kemas, dilengkapi ikon dan fungsi sorok/papar baki." },
      { label: "Optimasi Desktop", desc: "Penambahbaikan responsiveness untuk paparan web/desktop yang lebih seimbang." },
      { label: "Ketepatan Baki", desc: "Isu perbezaan nilai antara kad wallet dan Total Balance telah diselaraskan sepenuhnya." },
      { label: "Simpan Profil", desc: "Penambahan butang “Save” pada kemas kini Display Name di halaman Preferences." },
      { label: "Pembaikan Bug", desc: "Fungsi tambah komitmen berulang (recurring) dan duplicate rekod ke bulan lain kini kembali berfungsi dengan lancar." },
      { label: "Onboarding Baru", desc: "Pengenalan “4 Sebab Utama” pada halaman Login untuk membantu pengguna baharu memahami nilai aplikasi." },
      { label: "Keseragaman Branding", desc: "Penyelarasan saiz teks dan tipografi mengikut guideline di seluruh aplikasi." },
      { label: "Multi-Bahasa", desc: "Penambahbaikan terjemahan untuk Bahasa Melayu, Inggeris, Cina (Simplified), dan Tamil agar lebih natural." }
    ]
  },
  {
    date: "22 Januari 2026",
    title: "Pelancaran Fungsi Penuh (Multi-Wallet & Sinking Fund)",
    icon: Rocket,
    points: [
      { label: "Status Wallet Berbilang", desc: "Fungsi kini tersedia sepenuhnya. Pengguna boleh menambah wallet baru dengan menetapkan Initial Value (Contoh: Business Dobi - RM12,000)." },
      { label: "Paparan Dinamik", desc: "Memilih wallet tertentu hanya memaparkan baki wallet tersebut. Memilih Global Wealth memaparkan jumlah keseluruhan aset." },
      { label: "Pengurusan Komitmen", desc: "Kebolehan untuk menambah dan memadam komitmen dalam setiap wallet (penyelesaian isu teknikal telah berjaya)." },
      { label: "Sinking Fund (Kemas Kini Besar)", desc: "Logik Pengiraan: Contoh bagi renovasi premis (RM12,000 / 12 bulan), sistem akan automatik memasukkan RM1,000 sebagai komitmen bulanan. Paparan dipindahkan ke halaman khusus." }
    ]
  },
  {
    date: "14 Januari 2026",
    title: "Migrasi Data & Rekod",
    icon: Database,
    points: [
      { label: "Sistem Migrasi", desc: "Fungsi untuk mengesan data daripada versi lama dan memberi notifikasi kepada pengguna untuk memindahkan data tersebut ke sistem akaun berbilang wallet yang baru." },
      { label: "Sejarah Sinking Fund", desc: "Penambahan fungsi rekod dan sejarah untuk Sinking Fund." }
    ]
  },
  {
    date: "12 Januari 2026",
    title: "Logik Sistem, Struktur Data & Integrasi Sinking Fund",
    icon: Settings,
    points: [
      { label: "Ikon Baru", desc: "Penambahan mini ikon untuk Sinking Fund yang akan memberi refleksi kepada bajet bulanan." },
      { label: "Logik Wallet (Persistance)", desc: "Pilihan wallet kekal walaupun bertukar halaman." },
      { label: "Pengguna Baru & Global View", desc: "Paparan popup untuk pengguna baru. Paparan gabungan semua wallet untuk pengguna multi-akaun." },
      { label: "Tetapan Perkongsian", desc: "Menambah bahagian Wallet Sharing Settings untuk memilih akaun yang dikongsi dengan pasangan." },
      { label: "Tetapan User", desc: "DAH ADA PERUBAHAN" },
      { label: "Automatik Sinking Fund", desc: "Nilai Sinking Fund direfleksikan secara automatik ke bulan-bulan hadapan di halaman perancangan." }
    ]
  },
  {
    date: "5 Januari 2026",
    title: "Visualisasi Data & Analisis",
    icon: BarChart,
    points: [
      { label: "Tolok Visual (Gauge)", desc: "Halaman analisis kini menampilkan progress bar berbentuk semi-circle gauge." },
      { label: "Carta Bar", desc: "Penambahbaikan carta bar untuk paparan pendapatan bulanan dan perbelanjaan bulanan." }
    ]
  },
  {
    date: "4 Januari 2026",
    title: "Ciri Baru & Penambahbaikan Antaramuka (UI)",
    icon: Layout,
    points: [
      { label: "Sistem Wallet", desc: "Setiap wallet kini mengikut komitmen masing-masing dengan pilihan paparan keseluruhan." },
      { label: "Mini App Simulator", desc: "Pengenalan kalkulator persaraan dan kalkulator kos sebenar kereta & insurans." },
      { label: "Penambahbaikan UI", desc: "Paparan Result Card berbentuk wallet, native dropdown, butang Add Wallet, dan mod gelap (Dark Mode)." }
    ]
  },
  {
    date: "25 Disember 2025",
    title: "Permintaan Ciri Daripada Pengguna (User Request)",
    icon: MessageSquare,
    points: [
      { label: "Maklum Balas Pengguna", desc: "Cadangan untuk mewujudkan pilihan akaun berbilang (multi-wallet) seperti dompet, bank personal, bank bisnes, dan bank gaji." },
      { label: "Cadangan Fungsi", desc: "Kebolehan untuk memindahkan dana antara akaun (contoh: dari bank ke dompet)." }
    ]
  }
];

const AppHistory: React.FC<AppHistoryProps> = ({ onBack }) => {
  return (
    <div className="animate-fade-in pb-10 min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 max-w-2xl mx-auto mb-6">
        <button onClick={onBack} className="p-2.5 rounded-xl bg-surface border border-outline hover:bg-surfaceVariant transition-colors" aria-label="Kembali">
          <ChevronLeft className="w-5 h-5 text-onSurface" />
        </button>
        <div>
          <h1 className="type-title2 text-onSurface">Sejarah Aplikasi</h1>
          <p className="type-footnote">Kronologi kemaskini dan fungsi baharu.</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="relative border-l-2 border-outline/10 ml-3 space-y-12 pb-10">
          {historyData.map((item, index) => (
            <div key={index} className="relative pl-8 animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-0 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-surface border-2 border-primary shadow-sm z-10">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>

              {/* Date Label */}
              <span className="inline-block px-3 py-1 mb-2 text-[10px] font-bold text-primary bg-primary/10 rounded-full border border-primary/20">
                {item.date}
              </span>

              {/* Content Card */}
              <div className="bg-surface rounded-2xl p-5 border border-outline shadow-[var(--shadow-1)] relative overflow-hidden group hover:shadow-[var(--shadow-2)] transition-all">
                {/* Decorative Icon */}
                <div className="absolute top-4 right-4 text-onSurfaceVariant/5 group-hover:text-primary/10 transition-colors">
                  <item.icon className="w-16 h-16" />
                </div>

                <div className="relative z-10">
                  <h3 className="type-headline text-onSurface mb-4 pr-10 leading-tight">
                    {item.title}
                  </h3>

                  <ul className="space-y-3">
                    {item.points.map((point, idx) => (
                      <li key={idx} className="text-sm text-onSurfaceVariant leading-relaxed">
                        <span className="font-bold text-onSurface block mb-0.5">• {point.label}</span>
                        <span className="opacity-80 pl-3 block text-xs">{point.desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* End Dot */}
          <div className="absolute -left-[5px] bottom-0 w-3 h-3 rounded-full bg-outline/30"></div>
        </div>

        <div className="text-center text-[10px] text-onSurfaceVariant/50 pt-4">
          Terima kasih atas sokongan anda dalam menjadikan aplikasi ini lebih baik.
        </div>
      </div>
    </div>
  );
};

export default AppHistory;
