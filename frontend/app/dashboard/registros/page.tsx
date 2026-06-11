'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCaptures, type Registro } from '@/lib/api';

export default function RegistrosPage() {
  const { token } = useAuth();
  const router = useRouter();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      if (!localStorage.getItem('veridit_token')) { router.replace('/login'); return; }
    }
    if (!token) return;

    getCaptures(token)
      .then(({ registros }) => setRegistros(registros))
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, [token, router]);

  const filtrados = registros.filter(r =>
    r.titulo.toLowerCase().includes(filtro.toLowerCase()) ||
    r.url_alvo.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="app-layout animate-fade-in">
      <Sidebar />

      <main style={{ padding: '2rem', backgroundColor: 'var(--color-bg)', overflowY: 'auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem' }}>Registros</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Histórico de capturas certificadas.
            </p>
          </div>
          <Link href="/dashboard/nova-captura" className="btn btn-primary">
            <PlusIcon /> Nova Captura
          </Link>
        </div>

        <div className="card">
          {/* Busca */}
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <div style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }}>
              <SearchIcon />
            </div>
            <input
              type="text"
              className="input-field"
              placeholder="Buscar por título ou URL…"
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Estado de loading */}
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <div className="animate-spin" style={{
                width: '40px', height: '40px', borderRadius: '50%',
                border: '3px solid var(--color-border)',
                borderTopColor: 'var(--color-primary)',
                margin: '0 auto 1rem',
              }} />
              Carregando registros…
            </div>
          )}

          {/* Erro */}
          {erro && (
            <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>
              {erro}
            </div>
          )}

          {/* Tabela */}
          {!loading && !erro && (
            filtrados.length === 0 ? (
              <EmptyState temFiltro={filtro.length > 0} />
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '0.8125rem', fontWeight: 700 }}>
                      <th style={{ padding: '0.75rem 1rem' }}>TÍTULO</th>
                      <th style={{ padding: '0.75rem 1rem' }}>URL</th>
                      <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map(reg => (
                      <tr
                        key={reg.id}
                        style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background var(--transition)' }}
                        onClick={() => router.push(`/dashboard/registros/${reg.id}`)}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '1rem', fontWeight: 600, maxWidth: '220px' }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {reg.titulo}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', maxWidth: '260px' }}>
                          <span style={{
                            display: 'block', overflow: 'hidden', textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap', fontFamily: 'var(--font-jetbrains)',
                            fontSize: '0.75rem', color: 'var(--color-text-secondary)',
                          }}>
                            {reg.url_alvo}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <span style={{ color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                            Detalhes →
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', textAlign: 'right' }}>
                  {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
                </p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

function EmptyState({ temFiltro }: { temFiltro: boolean }) {
  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
      <div style={{
        width: '56px', height: '56px', background: 'var(--color-badge-bg)',
        borderRadius: '50%', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 1rem',
      }}>
        <SearchIcon />
      </div>
      <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>
        {temFiltro ? 'Nenhum resultado encontrado' : 'Nenhuma captura ainda'}
      </p>
      <p style={{ fontSize: '0.875rem' }}>
        {temFiltro
          ? 'Tente outros termos de busca.'
          : 'Inicie sua primeira captura para ver o histórico aqui.'}
      </p>
      {!temFiltro && (
        <Link href="/dashboard/nova-captura" className="btn btn-primary" style={{ display: 'inline-flex', marginTop: '1.5rem' }}>
          <PlusIcon /> Iniciar Captura
        </Link>
      )}
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────── */
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}
