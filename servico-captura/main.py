from fastapi import FastAPI, HTTPException
from schemas import CapturaRequest, CapturaResponse
from core.browser import capturar_tela_pagina
from core.security import gerar_hash_sha256
from db.repository import salvar_log_auditoria

app = FastAPI(title="Veridit - Serviço de Captura")

@app.post("/api/capture", response_model=CapturaResponse)
async def iniciar_captura(request: CapturaRequest):
    try:
        # 1. Captura a imagem (REQ 08 e 11)
        screenshot_bytes = await capturar_tela_pagina(str(request.url))
        
        # 2. Gera o Hash imediatamente após a captura (ADR 03)
        hash_img = gerar_hash_sha256(screenshot_bytes)
        
        # 3. Salva os metadados na trilha de auditoria (ADR 06)
        registro = salvar_log_auditoria(
            titulo=request.titulo,
            url_alvo=str(request.url),
            hash_img=hash_img,
            usuario_id=request.usuario_id
        )
        
        if not registro:
            raise HTTPException(status_code=500, detail="Erro ao gravar log de auditoria no Supabase.")

        return CapturaResponse(
            id_registro=str(registro.get('id', 'N/A')),
            hash_sha256=hash_img,
            tamanho_bytes=len(screenshot_bytes),
            status="Concluído"
        )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Falha na captura: {str(e)}")