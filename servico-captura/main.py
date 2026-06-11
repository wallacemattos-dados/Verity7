import sys
import asyncio
import base64
import uvicorn

# --- CONFIGURAÇÃO OBRIGATÓRIA PARA WINDOWS + PLAYWRIGHT ---
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
import logging
from traceback import format_exc
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from schemas import CapturaRequest, CapturaResponse
from core.browser import capturar_tela_pagina
from core.security import gerar_hash_sha256
from db.repository import salvar_log_auditoria

# Configuração básica de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Veridit - Serviço de Captura")

# Middleware CORS – permite requisições do frontend (incluindo arquivo local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rota para servir o frontend de teste (teste.html na raiz)
@app.get("/", response_class=HTMLResponse)
async def frontend():
    try:
        with open("teste.html", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logger.error("Arquivo teste.html não encontrado na raiz do projeto.")
        return HTMLResponse(content="<h1>Arquivo teste.html não encontrado</h1>", status_code=404)
    except Exception as e:
        logger.error(f"Erro ao ler teste.html: {str(e)}")
        return HTMLResponse(content="<h1>Erro interno ao carregar o frontend</h1>", status_code=500)

@app.post("/api/capture", response_model=CapturaResponse)
async def iniciar_captura(request: CapturaRequest):
    """
    Endpoint principal de captura de tela.
    Recebe URL, título e ID do usuário, retorna hash SHA-256 e metadados.
    """
    # Converte HttpUrl para string e valida
    url_str = str(request.url)
    if not url_str or not url_str.startswith(('http://', 'https://')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL inválida. Deve começar com http:// ou https://"
        )

    # Garante que título e usuário_id não sejam vazios (definindo padrões)
    titulo = request.titulo.strip() if request.titulo else "Captura sem título"
    usuario_id = request.usuario_id.strip() if request.usuario_id else "anonimo"

    try:
        logger.info(f"Iniciando captura para URL: {url_str} (usuário: {usuario_id})")

        # 1. Captura a imagem (REQ 08 e 11) – função assíncrona
        screenshot_bytes = await capturar_tela_pagina(url_str)
        logger.info(f"Captura concluída. Tamanho: {len(screenshot_bytes)} bytes")

        # 2. Gera o hash SHA-256 imediatamente após a captura (ADR 03)
        hash_img = gerar_hash_sha256(screenshot_bytes)
        logger.debug(f"Hash gerado: {hash_img[:16]}...")

        # 3. Salva os metadados na trilha de auditoria (ADR 06)
        registro = salvar_log_auditoria(
            titulo=titulo,
            url_alvo=url_str,
            hash_img=hash_img,
            usuario_id=usuario_id
        )

        if not registro:
            logger.error("Falha ao salvar log no Supabase: registro retornado vazio")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao gravar log de auditoria no Supabase."
            )

        logger.info(f"Log salvo com ID: {registro.get('id')}")

        # 4. Retorna resposta de sucesso
        return CapturaResponse(
            id_registro=str(registro.get('id', 'N/A')),
            hash_sha256=hash_img,
            tamanho_bytes=len(screenshot_bytes),
            status="Concluído",
            screenshot_base64=base64.b64encode(screenshot_bytes).decode('utf-8')
        )

    except HTTPException:
        # Repassa exceções HTTP já tratadas
        raise

    except asyncio.TimeoutError:
        logger.error(f"Timeout ao capturar a página: {url_str}")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Tempo limite excedido ao carregar a página."
        )

    except Exception as e:
        # Log completo do erro com traceback para depuração
        logger.error(f"Falha na captura para URL {url_str}:\n{format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Falha na captura: {str(e)}"
        )
    
if __name__ == "__main__":
    # Removemos as aspas do app e o reload=True para o Windows não criar subprocessos paralelos
    uvicorn.run(app, host="127.0.0.1", port=8000)