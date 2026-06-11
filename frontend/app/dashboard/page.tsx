'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCaptures, type Registro } from '@/lib/api';

export default function DashboardPage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      const stored = localStorage.getItem('veridit_token');
      if (!stored) router.replace('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    getCaptures(token)
      .then((data) => {

        const lista = Array.isArray(data) ? data : (data.registros || []);
        setRegistros(lista);
      })
      .catch(() => {})
      .finally(() => setLoadingData(false));
  }, [token]);

  if (!token || !user) return null;

  const firstName = user.email.split('@')[0];
  const recentes = (registros || []).slice(0, 5);

  return (
    <div className="app-layout animate-fade-in">
      <Sidebar />

      <main
        className="app-content"
        style={{ padding: '2rem', backgroundColor: 'var(--color-bg)', overflowY: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem' }}>Olá, {firstName}</h1>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              Bem-vindo ao seu painel de controle.
            </p>
          </div>
          <Link href="/dashboard/nova-captura" className="btn btn-primary">
            <PlusIcon /> Nova Captura
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <StatCard
            icon={<FileTextIcon />}
            iconBg="var(--color-badge-bg)"
            iconColor="var(--color-primary)"
            label="Total de Registros"
            value={loadingData ? '_' : String(registros?.length || 0)}
          />
          <StatCard
            icon={<CheckIcon />}
            iconBg="#E6F4EA"
            iconColor="var(--color-success)"
            label="Hashes Verificados"
            value={loadingData ? '_' : String(registros?.length || 0)}
          />
          <StatCard
            icon={<ShieldIcon />}
            iconBg="var(--color-accent-soft)"
            iconColor="var(--color-accent)"
            label="Conta"
            value={user.role}
            isText
          />
        </div>

        {/* Tabela de registros recentes */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Registros Recentes</h2>
            {(registros?.length || 0) > 0 && (
              <Link href="/dashboard/registros" style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                Ver todos →
              </Link>
            )}
          </div>

          {loadingData ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <div className="animate-spin" style={{
                width: '36px', height: '36px', borderRadius: '50%',
                border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)',
                margin: '0 auto',
              }} />
            </div>
          ) : recentes.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <div style={{
                width: '64px', height: '64px', background: 'var(--color-badge-bg)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', margin: '0 auto 1rem',
              }}>
                <InboxIcon />
              </div>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Nenhuma captura ainda</p>
              <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                Inicie sua primeira captura para gerar uma prova digital certificada.
              </p>
              <Link href="/dashboard/nova-captura" className="btn btn-primary" style={{ display: 'inline-flex' }}>
                <PlusIcon /> Iniciar Captura
              </Link>
            </div>
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
                  {recentes?.map(reg => (
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
                      <td style={{ padding: '1rem', maxWidth: '300px' }}>
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
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, iconBg, iconColor, label, value, isText }: {
  icon: React.ReactNode; iconBg: string; iconColor: string;
  label: string; value: string; isText?: boolean;
}) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <div style={{
        width: '48px', height: '48px', background: iconBg, color: iconColor,
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{label}</p>
        <p style={{
          fontSize: isText ? '1rem' : '1.5rem', fontWeight: 700,
          fontFamily: isText ? undefined : 'var(--font-jetbrains)',
          textTransform: isText ? 'capitalize' : undefined, marginTop: '0.125rem',
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function FileTextIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
}
function CheckIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function ShieldIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
}
function InboxIcon() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-primary)' }}><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>;
}