"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { solicitarCaptura, type CapturaResponse } from "@/lib/api";

type Step = 1 | 2 | 3;

const STEPS = ["Configuração", "Processando", "Concluído"];

const STATUS_MESSAGES = [
  { text: "Conectando ao site…", progress: 15 },
  { text: "Renderizando a página…", progress: 35 },
  { text: "Capturando screenshot…", progress: 55 },
  { text: "Gerando hash SHA-256…", progress: 75 },
  { text: "Salvando na trilha de auditoria…", progress: 90 },
  { text: "Aguardando resposta do servidor…", progress: 92 },
];

export default function NovaCapturaPage() {
  const { token, user } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [url, setUrl] = useState("");
  const [titulo, setTitulo] = useState("");
  const [error, setError] = useState("");

  const [statusMsg, setStatusMsg] = useState(STATUS_MESSAGES[0].text);
  const [progress, setProgress] = useState(0);
  const [resultado, setResultado] = useState<CapturaResponse | null>(null);

  // Ref para evitar que a Promise stale atualize state após desmonte
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Guard de autenticação
  useEffect(() => {
    if (token === null && typeof window !== "undefined") {
      if (!localStorage.getItem("veridit_token")) router.replace("/login");
    }
  }, [token, router]);

  // Animação de progresso — roda apenas durante o step 2, em loop
  useEffect(() => {
    if (step !== 2) return;

    let idx = 0;
    const interval = setInterval(() => {
      // Avança até o penúltimo, depois fica oscilando nos dois últimos
      const nextIdx =
        idx < STATUS_MESSAGES.length - 2
          ? idx + 1
          : idx === STATUS_MESSAGES.length - 2
            ? STATUS_MESSAGES.length - 1
            : STATUS_MESSAGES.length - 2;
      idx = nextIdx;
      setStatusMsg(STATUS_MESSAGES[idx].text);
      setProgress(STATUS_MESSAGES[idx].progress);
    }, 1400);

    return () => clearInterval(interval);
  }, [step]);

  // ─── Submissão do formulário — a chamada à API vai AQUI, não num effect ───
  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setProgress(STATUS_MESSAGES[0].progress);
    setStatusMsg(STATUS_MESSAGES[0].text);
    setStep(2);

    try {
      const res = await solicitarCaptura(token!, {
        titulo: titulo,
        url_alvo: url,
        usuario_id: user!.id,
      });
      if (!mountedRef.current) return;
      setProgress(100);
      setStatusMsg("Concluído!");
      setTimeout(() => {
        if (!mountedRef.current) return;
        setResultado(res);
        setStep(3);
      }, 500);
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      setError(
        err instanceof Error
          ? err.message
          : "Erro na captura. Verifique se o backend está rodando.",
      );
      setStep(1);
    }
  }

  if (!token || !user) return null;

  return (
    <div className="app-layout animate-fade-in">
      <Sidebar />

      <main
        style={{
          padding: "2rem",
          backgroundColor: "var(--color-bg)",
          overflowY: "auto",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            marginBottom: "1.5rem",
          }}
        >
          <ArrowLeftIcon /> Voltar ao Dashboard
        </Link>

        {/* Stepper */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "3rem",
          }}
        >
          {STEPS.map((label, i) => {
            const n = (i + 1) as Step;
            const done = step > n;
            const active = step >= n;
            return (
              <div
                key={label}
                style={{ display: "flex", alignItems: "center" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background: active
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      transition: "background 300ms ease",
                    }}
                  >
                    {done ? <CheckSmallIcon /> : n}
                  </div>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: active
                        ? "var(--color-primary)"
                        : "var(--color-text-secondary)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      width: "80px",
                      height: "2px",
                      margin: "0 0.75rem",
                      marginBottom: "1.5rem",
                      background: done
                        ? "var(--color-primary)"
                        : "var(--color-border)",
                      transition: "background 300ms ease",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          {step === 1 && (
            <StepConfig
              url={url}
              titulo={titulo}
              error={error}
              onUrlChange={setUrl}
              onTituloChange={setTitulo}
              onSubmit={handleStart}
            />
          )}
          {step === 2 && (
            <StepProcessing statusMsg={statusMsg} progress={progress} />
          )}
          {step === 3 && resultado && (
            <StepConcluido
              resultado={resultado}
              titulo={titulo}
              url={url}
              onNovaCap={() => {
                setUrl("");
                setTitulo("");
                setResultado(null);
                setError("");
                setStep(1);
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
}

/* ── Step 1 ──────────────────────────────────────────────── */
function StepConfig({
  url,
  titulo,
  error,
  onUrlChange,
  onTituloChange,
  onSubmit,
}: {
  url: string;
  titulo: string;
  error: string;
  onUrlChange(v: string): void;
  onTituloChange(v: string): void;
  onSubmit(e: React.FormEvent): void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Iniciar Nova Captura
      </h2>
      <p
        style={{
          color: "var(--color-text-secondary)",
          marginBottom: "2rem",
          fontSize: "0.9375rem",
        }}
      >
        Informe a URL e um título para identificar a prova digital.
      </p>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <div>
          <label style={labelStyle}>URL do Site</label>
          <input
            type="url"
            className="input-field"
            placeholder="https://exemplo.com/pagina-da-evidencia"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>Título do Registro</label>
          <input
            type="text"
            className="input-field"
            placeholder="Ex: Post difamatório no Instagram"
            value={titulo}
            onChange={(e) => onTituloChange(e.target.value)}
            required
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.875rem",
            alignItems: "flex-start",
            padding: "1rem",
            background: "var(--color-warning-bg)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.875rem",
            color: "var(--color-warning-text)",
          }}
        >
          <InfoIcon />
          <p>
            O Veridit captura a tela em ambiente isolado e aplica imediatamente
            um <strong>hash SHA-256</strong>. A operação pode levar até 30
            segundos.
          </p>
        </div>

        {error && (
          <p
            style={{
              padding: "0.75rem 1rem",
              background: "var(--color-danger-bg)",
              color: "var(--color-danger)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.875rem",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%", padding: "0.875rem" }}
        >
          Iniciar Captura
        </button>
      </form>
    </div>
  );
}

/* ── Step 2 ──────────────────────────────────────────────── */
function StepProcessing({
  statusMsg,
  progress,
}: {
  statusMsg: string;
  progress: number;
}) {
  return (
    <div style={{ textAlign: "center", padding: "2rem 0" }}>
      <div
        style={{
          position: "relative",
          display: "inline-block",
          marginBottom: "2rem",
        }}
      >
        <div
          className="animate-spin"
          style={{
            width: "96px",
            height: "96px",
            borderRadius: "50%",
            border: "4px solid var(--color-border)",
            borderTopColor: "var(--color-primary)",
          }}
        />
        <div
          className="animate-pulse-slow"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "var(--color-primary)",
          }}
        >
          <CameraIcon />
        </div>
      </div>

      <h2 style={{ fontSize: "1.375rem", marginBottom: "1rem" }}>
        {statusMsg}
      </h2>

      <div
        style={{
          width: "100%",
          height: "8px",
          background: "var(--color-border)",
          borderRadius: "4px",
          overflow: "hidden",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "var(--color-primary)",
            borderRadius: "4px",
            transition: "width 0.8s ease",
          }}
        />
      </div>

      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem" }}>
        Por favor, não feche esta janela. O Playwright pode levar até 30s.
      </p>
    </div>
  );
}

/* ── Step 3 ──────────────────────────────────────────────── */
function gerarPDF(resultado: CapturaResponse, titulo: string, url: string) {
  const dataHora = new Date().toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const imgTag = resultado.screenshot_base64
    ? `<img src="data:image/png;base64,${resultado.screenshot_base64}" style="width:100%;display:block;border:1px solid #E2DDD5;border-radius:4px;" />`
    : '<p style="color:#6B6560;font-style:italic;">Imagem não disponível.</p>';

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8"/>
  <title>Veridit — ${titulo}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',sans-serif;background:#fff;color:#1A1A1A;padding:48px;position:relative;min-height:100vh}
    h1,h2,h3{font-family:'Playfair Display',serif}

    /* Marca d'água */
    .watermark{
      position:fixed;top:0;left:0;width:100%;height:100%;
      display:flex;flex-wrap:wrap;align-content:center;justify-content:center;
      pointer-events:none;z-index:0;overflow:hidden;
      transform:rotate(-42deg);
      opacity:0.04;
      font-family:'Playfair Display',serif;
      font-size:5rem;font-weight:900;
      color:#1A2744;
      gap:2rem;
      line-height:1.2;
    }

    .content{position:relative;z-index:1;max-width:800px;margin:0 auto}

    /* Cabeçalho */
    .header{display:flex;justify-content:space-between;align-items:flex-start;
      border-bottom:2px solid #1A2744;padding-bottom:1.5rem;margin-bottom:2.5rem}
    .header-brand h1{color:#1A2744;font-size:2.5rem}
    .header-brand p{letter-spacing:2px;font-size:0.6875rem;font-weight:700;color:#6B6560;margin-top:4px}
    .header-seal{border:2px solid #C9A84C;padding:0.75rem 1rem;text-align:center}
    .header-seal p:first-child{font-size:0.625rem;font-weight:700;color:#C9A84C;letter-spacing:1.5px}
    .header-seal p:last-child{font-family:'JetBrains Mono',monospace;font-size:0.8125rem;margin-top:4px;color:#1A2744}

    /* Seções */
    section{margin-bottom:2rem}
    .section-title{font-size:0.875rem;font-weight:700;background:#F7F6F3;
      padding:0.5rem 1rem;margin-bottom:1.25rem;color:#1A2744;
      text-transform:uppercase;letter-spacing:1px}

    /* Grid de campos */
    .fields{display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;padding:0 0.5rem}
    .fields.single{grid-template-columns:1fr}
    .field label{font-size:0.6875rem;color:#6B6560;text-transform:uppercase;
      letter-spacing:0.06em;font-weight:600;display:block;margin-bottom:3px}
    .field p{font-weight:700;font-size:0.9375rem;word-break:break-all}
    .field p.mono{font-family:'JetBrains Mono',monospace;font-size:0.8125rem;font-weight:600}

    /* Hash */
    .hash-box{background:#EAF0FF;border-radius:6px;padding:1rem;margin-top:1.25rem}
    .hash-box label{font-size:0.6875rem;color:#6B6560;text-transform:uppercase;letter-spacing:0.06em;font-weight:700;display:block;margin-bottom:6px}
    .hash-box p{font-family:'JetBrains Mono',monospace;font-size:0.75rem;color:#1A2744;font-weight:600;word-break:break-all}

    /* Screenshot */
    .screenshot-section{margin-bottom:2rem}
    .screenshot-title{font-size:0.875rem;font-weight:700;background:#F7F6F3;
      padding:0.5rem 1rem;margin-bottom:1rem;color:#1A2744;
      text-transform:uppercase;letter-spacing:1px}

    /* Rodapé */
    .footer{margin-top:3rem;padding-top:1.5rem;border-top:1px solid #E2DDD5;
      text-align:center;font-size:0.75rem;color:#6B6560;line-height:1.8}
    .footer strong{color:#1A2744}

    @media print{
      body{padding:32px}
      .watermark{position:fixed}
    }
  </style>
</head>
<body>
  <div class="watermark">
    ${"VERIDIT&nbsp;&nbsp; ".repeat(60)}
  </div>

  <div class="content">
    <!-- Cabeçalho -->
    <div class="header">
      <div class="header-brand">
        <h1>Veridit</h1>
        <p>RELATÓRIO DE REGISTRO DE CONTEÚDO DIGITAL</p>
      </div>
      <div class="header-seal">
        <p>DOCUMENTO CERTIFICADO</p>
        <p>#${resultado.id_registro}</p>
      </div>
    </div>

    <!-- Seção 1 — Dados do Registro -->
    <section>
      <div class="section-title">1. Dados do Registro</div>
      <div class="fields">
        <div class="field">
          <label>ID do Sistema</label>
          <p class="mono">${resultado.id_registro}</p>
        </div>
        <div class="field">
          <label>Data / Hora da Captura</label>
          <p>${dataHora}</p>
        </div>
        <div class="field" style="grid-column:span 2">
          <label>Título da Evidência</label>
          <p>${titulo}</p>
        </div>
        <div class="field" style="grid-column:span 2">
          <label>URL de Origem</label>
          <p class="mono">${url}</p>
        </div>
        <div class="field">
          <label>Tamanho do Arquivo</label>
          <p class="mono">${(resultado.tamanho_bytes / 1024).toFixed(1)} KB</p>
        </div>
        <div class="field">
          <label>Status</label>
          <p>${resultado.status}</p>
        </div>
      </div>
      <div class="hash-box" style="margin:1.25rem 0.5rem 0">
        <label>Hash de Integridade (SHA-256)</label>
        <p>${resultado.hash_sha256}</p>
      </div>
    </section>

    <!-- Seção 2 — Screenshot -->
    <section class="screenshot-section">
      <div class="screenshot-title">2. Screenshot Certificado</div>
      <div style="padding:0 0.5rem">${imgTag}</div>
    </section>

    <!-- Rodapé -->
    <div class="footer">
      <p>Este documento foi gerado automaticamente pelo sistema <strong>Veridit</strong> e possui cadeia de custódia digital preservada.</p>
      <p>O hash SHA-256 acima garante a integridade do arquivo conforme a <strong>MP 2.200-2/2001</strong>.</p>
      <p style="margin-top:8px;opacity:0.6">Gerado em ${dataHora} · veridit.com.br</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() { window.print(); }, 400);
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank", "width=900,height=700");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

function StepConcluido({
  resultado,
  titulo,
  url,
  onNovaCap,
}: {
  resultado: CapturaResponse;
  titulo: string;
  url: string;
  onNovaCap(): void;
}) {
  function copyHash() {
    navigator.clipboard.writeText(resultado.hash_sha256);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          width: "80px",
          height: "80px",
          background: "var(--color-success)",
          color: "white",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 1.5rem",
        }}
      >
        <CheckLargeIcon />
      </div>

      <h2 style={{ fontSize: "1.875rem", marginBottom: "0.5rem" }}>
        Captura Concluída!
      </h2>
      <p
        style={{ color: "var(--color-text-secondary)", marginBottom: "2.5rem" }}
      >
        O conteúdo foi registrado e certificado com sucesso.
      </p>

      {/* Preview da captura */}
      {resultado.screenshot_base64 && (
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          <p
            style={{
              padding: "0.75rem 1rem",
              fontSize: "0.8125rem",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              borderBottom: "1px solid var(--color-border)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Screenshot Capturado
          </p>
          <div
            style={{
              maxHeight: "520px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            <img
              src={`data:image/png;base64,${resultado.screenshot_base64}`}
              alt="Screenshot capturado"
              style={{ width: "100%", display: "block" }}
            />
          </div>
        </div>
      )}

      <div className="card" style={{ textAlign: "left", marginBottom: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1.25rem",
            fontSize: "0.875rem",
          }}
        >
          <ResultField
            label="ID do Registro"
            value={resultado.id_registro}
            mono
          />
          <ResultField label="Status" value={resultado.status} />
          <div style={{ gridColumn: "span 2" }}>
            <ResultField label="Título" value={titulo} />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <ResultField label="URL Capturada" value={url} mono small />
          </div>
          <ResultField
            label="Tamanho"
            value={`${(resultado.tamanho_bytes / 1024).toFixed(1)} KB`}
            mono
          />
        </div>

        {/* Hash em destaque */}
        <div
          style={{
            marginTop: "1.25rem",
            padding: "1rem",
            background: "var(--color-badge-bg)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Hash SHA-256
            </p>
            <button
              onClick={copyHash}
              className="btn-ghost"
              style={{
                fontSize: "0.75rem",
                color: "var(--color-primary)",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <CopyIcon /> Copiar
            </button>
          </div>
          <p
            style={{
              fontFamily: "var(--font-jetbrains)",
              fontSize: "0.75rem",
              wordBreak: "break-all",
              color: "var(--color-primary)",
              fontWeight: 600,
            }}
          >
            {resultado.hash_sha256}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <button onClick={onNovaCap} className="btn btn-outline">
          Nova Captura
        </button>
        <button
          onClick={() => gerarPDF(resultado, titulo, url)}
          className="btn btn-outline"
          style={{
            borderColor: "var(--color-accent)",
            color: "var(--color-accent)",
          }}
        >
          <PdfIcon /> Baixar PDF
        </button>
        <Link href="/dashboard" className="btn btn-primary">
          Ir ao Dashboard
        </Link>
      </div>
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────── */
function ResultField({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: "0.6875rem",
          color: "var(--color-text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
          fontWeight: 600,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: mono ? "var(--font-jetbrains)" : undefined,
          fontSize: small ? "0.75rem" : "0.9375rem",
          fontWeight: mono ? 600 : 700,
          wordBreak: "break-all",
        }}
      >
        {value}
      </p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 600,
  marginBottom: "0.5rem",
  color: "var(--color-text-secondary)",
};

/* ── Icons ───────────────────────────────────────────────── */
function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}
function CheckSmallIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function CheckLargeIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function InfoIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: "1px" }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function PdfIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  );
}
