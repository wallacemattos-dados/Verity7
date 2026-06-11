'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { getCapture, type Registro } from '@/lib/api';

export default function RegistroDetalhePage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [registro, setRegistro] = useState<Registro | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (token === null && typeof window !== 'undefined') {
      if (!localStorage.getItem('veridit_token')) { router.replace('/login'); return; }
    }
    if (!token || !id) return;

    getCapture(token, id)
      .then(setRegistro)
      .catch(e => setErro(e.message))
      .finally(() => setLoading(false));
  }, [token, id, router]);

  function copiarHash() {
    if (registro) navigator.clipboard.writeText(registro.hash_img);
  }

  function gerarPDF() {
    if (!registro) return;
    const dataHora = registro.created_at ? formatarData(registro.created_at) : '—';
    const html = buildPdfHtml(registro, dataHora);
    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) { win.document.write(html); win.document.close(); }
  }

  if (loading) return (
    <div className="app-layout">
      <Sidebar />
      <main style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-spin" style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)',
        }} />
      </main>
    </div>
  );

  return (
    <div className="app-layout animate-fade-in">
      <Sidebar />

      <main style={{ padding: '2rem', backgroundColor: 'var(--color-bg)', overflowY: 'auto' }}>
        {/* Breadcrumb */}
        <Link href="/dashboard/registros" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem',
        }}>
          <ArrowLeftIcon /> Voltar para Registros
        </Link>

        {erro ? (
          <div style={{ padding: '1rem', background: 'var(--color-danger-bg)', color: 'var(--color-danger)', borderRadius: 'var(--radius-sm)' }}>
            {erro}
          </div>
        ) : registro && (
          <>
            {/* Título + ações */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem' }}>{registro.titulo}</h1>
                {registro.created_at && (
                  <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem', fontSize: '0.875rem' }}>
                    {formatarData(registro.created_at)}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
                <button
                  onClick={gerarPDF}
                  className="btn btn-outline"
                  style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}
                >
                  <PdfIcon /> Baixar PDF
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', alignItems: 'start' }}>
              {/* Coluna principal */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Informações gerais */}
                <div className="card">
                  <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>
                    Informações Gerais
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                    <Campo label="ID do Sistema" valor={registro.id} mono />
                    {registro.created_at && <Campo label="Data / Hora" valor={formatarData(registro.created_at)} />}
                    <div style={{ gridColumn: 'span 2' }}>
                      <Campo label="URL Capturada" valor={registro.url_alvo} mono small />
                    </div>
                  </div>

                  {/* Hash */}
                  <div style={{
                    marginTop: '1.25rem', padding: '1rem',
                    background: 'var(--color-badge-bg)', borderRadius: 'var(--radius-sm)',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Hash SHA-256
                      </p>
                      <button onClick={copiarHash} className="btn-ghost"
                        style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CopyIcon /> Copiar
                      </button>
                    </div>
                    <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--color-primary)', fontWeight: 600 }}>
                      {registro.hash_img}
                    </p>
                  </div>
                </div>
              </div>

              {/* Coluna lateral — status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '56px', height: '56px', background: 'var(--color-success-bg)',
                    color: 'var(--color-success)', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.75rem',
                  }}>
                    <CheckIcon />
                  </div>
                  <p style={{ fontWeight: 700, color: 'var(--color-success)' }}>Concluído</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                    Integridade verificada
                  </p>
                </div>

                <div className="card">
                  <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Ações
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <button onClick={gerarPDF} className="btn btn-primary" style={{ width: '100%' }}>
                      <PdfIcon /> Gerar Relatório PDF
                    </button>
                    <Link href="/dashboard/nova-captura" className="btn btn-outline" style={{ width: '100%' }}>
                      Nova Captura
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

/* ── PDF ─────────────────────────────────────────────────── */
function buildPdfHtml(reg: Registro, dataHora: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head>
  <meta charset="UTF-8"/><title>Veridit — ${reg.titulo}</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#fff;color:#1A1A1A;padding:48px;position:relative}
    h1,h2{font-family:'Playfair Display',serif}
    .wm{position:fixed;top:0;left:0;width:100%;height:100%;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;pointer-events:none;z-index:0;overflow:hidden;transform:rotate(-42deg);opacity:.04;font-family:'Playfair Display',serif;font-size:5rem;font-weight:900;color:#1A2744;gap:2rem;line-height:1.2}
    .c{position:relative;z-index:1;max-width:800px;margin:0 auto}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #1A2744;padding-bottom:1.5rem;margin-bottom:2.5rem}
    .hdr h1{color:#1A2744;font-size:2.5rem}.hdr p{font-size:.6875rem;font-weight:700;color:#6B6560;letter-spacing:2px;margin-top:4px}
    .seal{border:2px solid #C9A84C;padding:.75rem 1rem;text-align:center}.seal p:first-child{font-size:.625rem;font-weight:700;color:#C9A84C;letter-spacing:1.5px}.seal p:last-child{font-family:'JetBrains Mono',monospace;font-size:.8125rem;margin-top:4px;color:#1A2744}
    .st{font-size:.875rem;font-weight:700;background:#F7F6F3;padding:.5rem 1rem;margin-bottom:1.25rem;color:#1A2744;text-transform:uppercase;letter-spacing:1px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;padding:0 .5rem;margin-bottom:1.25rem}
    .f label{font-size:.6875rem;color:#6B6560;text-transform:uppercase;letter-spacing:.06em;font-weight:600;display:block;margin-bottom:3px}
    .f p{font-weight:700;font-size:.9375rem;word-break:break-all}.f p.m{font-family:'JetBrains Mono',monospace;font-size:.8125rem;font-weight:600}
    .hbox{background:#EAF0FF;border-radius:6px;padding:1rem;margin:0 .5rem}
    .hbox label{font-size:.6875rem;color:#6B6560;text-transform:uppercase;letter-spacing:.06em;font-weight:700;display:block;margin-bottom:6px}
    .hbox p{font-family:'JetBrains Mono',monospace;font-size:.75rem;color:#1A2744;font-weight:600;word-break:break-all}
    footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #E2DDD5;text-align:center;font-size:.75rem;color:#6B6560;line-height:1.8}
    footer strong{color:#1A2744}
  </style>
</head><body>
  <div class="wm">${'VERIDIT&nbsp;&nbsp; '.repeat(60)}</div>
  <div class="c">
    <div class="hdr">
      <div><h1>Veridit</h1><p>RELATÓRIO DE REGISTRO DE CONTEÚDO DIGITAL</p></div>
      <div class="seal"><p>DOCUMENTO CERTIFICADO</p><p>#${reg.id}</p></div>
    </div>
    <section style="margin-bottom:2rem">
      <div class="st">1. Dados do Registro</div>
      <div class="grid">
        <div class="f"><label>ID do Sistema</label><p class="m">${reg.id}</p></div>
        <div class="f"><label>Data / Hora</label><p>${dataHora}</p></div>
        <div class="f" style="grid-column:span 2"><label>Título da Evidência</label><p>${reg.titulo}</p></div>
        <div class="f" style="grid-column:span 2"><label>URL de Origem</label><p class="m">${reg.url_alvo}</p></div>
      </div>
      <div class="hbox"><label>Hash de Integridade (SHA-256)</label><p>${reg.hash_img}</p></div>
    </section>
    <footer>
      <p>Documento gerado pelo sistema <strong>Veridit</strong>. Cadeia de custódia digital preservada.</p>
      <p>Hash SHA-256 garante integridade conforme <strong>MP 2.200-2/2001</strong>.</p>
      <p style="margin-top:8px;opacity:.6">Gerado em ${dataHora} · veridit.com.br</p>
    </footer>
  </div>
  <script>window.onload=()=>setTimeout(()=>window.print(),400)</script>
</body></html>`;
}

/* ── Helpers ─────────────────────────────────────────────── */
function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function Campo({ label, valor, mono, small }: { label: string; valor: string; mono?: boolean; small?: boolean }) {
  return (
    <div>
      <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.25rem' }}>
        {label}
      </p>
      <p style={{ fontFamily: mono ? 'var(--font-jetbrains)' : undefined, fontSize: small ? '0.75rem' : '0.9375rem', fontWeight: 700, wordBreak: 'break-all' }}>
        {valor}
      </p>
    </div>
  );
}

/* ── Icons ───────────────────────────────────────────────── */
function ArrowLeftIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
}
function CheckIcon() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
}
function CopyIcon() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
}
function PdfIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>;
}
