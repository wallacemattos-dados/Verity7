'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutIcon /> },
    { href: '/dashboard/registros', label: 'Registros', icon: <ListIcon /> },
  ];

  return (
    <aside
      className="app-sidebar"
      style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', color: 'var(--color-accent)', fontSize: '2rem' }}>
          Veridit
        </h1>
        <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.45)', letterSpacing: '1.5px', marginTop: '0.125rem', fontWeight: 600 }}>
          EVIDÊNCIAS DIGITAIS
        </p>
      </div>

      {/* User info */}
      <div
        style={{
          marginBottom: '2rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.07)',
          borderRadius: 'var(--radius-md)',
        }}
      >
        <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white' }}>
          {user?.email ?? '—'}
        </p>
        <p style={{ fontSize: '0.75rem', opacity: 0.55, marginTop: '0.25rem', textTransform: 'capitalize' }}>
          {user?.role ?? 'cliente'}
        </p>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flexGrow: 1 }}>
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                fontWeight: active ? 700 : 500,
                background: active ? 'rgba(255,255,255,0.12)' : 'transparent',
                transition: 'var(--transition)',
                textDecoration: 'none',
                fontSize: '0.9375rem',
              }}
            >
              {icon}
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.625rem 0.875rem',
            borderRadius: 'var(--radius-sm)',
            color: '#ff8a8a',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9375rem',
            width: '100%',
          }}
        >
          <SignOutIcon />
          Sair
        </button>
      </div>
    </aside>
  );
}

/* ── Icons ─────────────────────────────────────────────── */
function LayoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
