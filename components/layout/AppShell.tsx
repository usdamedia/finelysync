import React from 'react';
import { Plus, LogOut, TrendingUp, TrendingDown } from 'lucide-react';
import { Logo } from '../Logo';
import { Button, IconButton, Modal } from '../ui';

export interface NavItem {
  key: string;
  label: string;
  icon: React.ElementType;
}

interface AppShellProps {
  navItems: NavItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  /** When true, sub-page back affordance should be shown by the page itself. */
  displayName?: string;
  email?: string | null;
  photoURL?: string;
  isGuest?: boolean;
  onLogout?: () => void;
  onQuickAdd: (type: 'income' | 'expense') => void;
  children: React.ReactNode;
}

const initials = (name?: string) => (name?.trim()?.charAt(0) || 'U').toUpperCase();

const AppShell: React.FC<AppShellProps> = ({
  navItems,
  activeKey,
  onNavigate,
  displayName = 'Pengguna',
  email,
  photoURL,
  isGuest = false,
  onLogout,
  onQuickAdd,
  children,
}) => {
  const [showQuickMenu, setShowQuickMenu] = React.useState(false);

  const handleQuick = (type: 'income' | 'expense') => {
    setShowQuickMenu(false);
    onQuickAdd(type);
  };

  return (
    <div className="min-h-screen bg-background text-onSurface">
      {/* Ambient backdrop — gives materials depth to blur */}
      <div className="app-ambient" aria-hidden="true" />

      {/* ── Desktop / tablet sidebar (functional layer material) ── */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[260px] flex-col material-bar material-divider-r z-40">
        <div className="flex items-center gap-3 px-5 h-16 border-b border-outline">
          <Logo className="w-9 h-9" />
          <div className="min-w-0">
            <p className="type-headline text-onSurface leading-none truncate">FinelySync</p>
            <p className="type-caption mt-0.5">Family Finance</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeKey === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                aria-current={active ? 'page' : undefined}
                className={[
                  'w-full flex items-center gap-3 px-3 h-11 rounded-xl type-subheadline font-medium',
                  active ? 'bg-primary/10 text-primary' : 'text-onSurfaceVariant hover:bg-surfaceVariant hover:text-onSurface',
                ].join(' ')}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 2} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-outline space-y-3">
          <Button fullWidth leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowQuickMenu(true)}>
            Tambah Transaksi
          </Button>

          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-surfaceVariant flex items-center justify-center shrink-0">
              {photoURL ? (
                <img src={photoURL} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="type-subheadline font-semibold text-primary">{initials(displayName)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="type-subheadline font-semibold text-onSurface truncate">{displayName}</p>
              <p className="type-caption truncate">{isGuest ? 'Tetamu' : email}</p>
            </div>
            {onLogout && (
              <IconButton label="Log keluar" size="sm" onClick={onLogout}>
                <LogOut className="w-4 h-4" />
              </IconButton>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="relative z-10 lg:pl-[260px]">
        <div className="mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8 py-5 md:py-8 pb-28 lg:pb-10">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom navigation ───────────────────────────── */}
      <div className="lg:hidden fixed left-0 right-0 bottom-0 z-50 pointer-events-none">
        <nav className="pointer-events-auto ios-tab-bar safe-bottom" aria-label="Navigasi utama">
          <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
            {navItems.slice(0, 2).map((item) => (
              <TabButton key={item.key} item={item} active={activeKey === item.key} onClick={() => onNavigate(item.key)} />
            ))}

            <div className="relative -top-4">
              <button
                onClick={() => setShowQuickMenu(true)}
                aria-label="Tambah transaksi"
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-[var(--shadow-2)] bg-primary text-onPrimary active:scale-90 transition-transform"
              >
                <Plus className="w-6 h-6" strokeWidth={2.5} />
              </button>
            </div>

            {navItems.slice(2).map((item) => (
              <TabButton key={item.key} item={item} active={activeKey === item.key} onClick={() => onNavigate(item.key)} />
            ))}
          </div>
        </nav>
      </div>

      {/* ── Quick add ──────────────────────────────────────────── */}
      <Modal isOpen={showQuickMenu} onClose={() => setShowQuickMenu(false)} title="Tambah Transaksi" subtitle="Rekodkan aliran wang anda">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleQuick('income')}
            className="flex flex-col items-center justify-center gap-2 h-28 rounded-2xl bg-primary/10 text-primary hover:bg-primary/15 active:scale-[0.98]"
          >
            <span className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center">
              <TrendingUp size={20} strokeWidth={2.4} />
            </span>
            <span className="type-subheadline font-semibold">Pendapatan</span>
          </button>
          <button
            onClick={() => handleQuick('expense')}
            className="flex flex-col items-center justify-center gap-2 h-28 rounded-2xl bg-error/10 text-error hover:bg-error/15 active:scale-[0.98]"
          >
            <span className="w-11 h-11 rounded-full bg-error/15 flex items-center justify-center">
              <TrendingDown size={20} strokeWidth={2.4} />
            </span>
            <span className="type-subheadline font-semibold">Komitmen</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};

const TabButton: React.FC<{ item: NavItem; active: boolean; onClick: () => void }> = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={[
        'flex flex-col items-center justify-center w-16 h-12 rounded-xl',
        active ? 'text-primary' : 'text-onSurfaceVariant',
      ].join(' ')}
    >
      <Icon className="w-6 h-6" strokeWidth={active ? 2.4 : 2} />
      <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
    </button>
  );
};

export default AppShell;
