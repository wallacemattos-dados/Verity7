'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password);
      router.push('/login?registered=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      {/* Branding */}
      <div
        className="auth-branding"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
        }}
      >
        <h1 style={{ fontSize: '3.5rem', color: 'var(--color-accent)' }}>Veridit</h1>
        <p style={{ fontSize: '1.375rem', marginTop: '1rem', opacity: 0.9, fontFamily: 'var(--font-dm-sans)' }}>
          Cadastre-se e comece a registrar evidências com segurança.
        </p>
        <p style={{ marginTop: '2rem', opacity: 0.7, lineHeight: 1.7, fontSize: '0.9375rem' }}>
          Sua conta permite capturar, certificar e gerenciar provas digitais com rastreabilidade total e hash SHA-256.
        </p>
      </div>

      {/* Formulário */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '4rem',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.375rem' }}>Criar Conta</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            Preencha os dados para criar sua conta.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label style={labelStyle}>Senha</label>
              <input
                type="password"
                className="input-field"
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>

            <div>
              <label style={labelStyle}>Confirmar Senha</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repita a senha"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-danger)',
                  padding: '0.75rem 1rem',
                  background: 'var(--color-danger-bg)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '0.25rem' }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Já tem uma conta?{' '}
            <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '0.5rem',
  color: 'var(--color-text-secondary)',
};
