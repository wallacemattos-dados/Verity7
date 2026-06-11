import asyncio
from core.browser import capturar_tela_pagina

async def rodar_teste():
    url_teste = "https://exame.com/"
    print(f"Iniciando captura do site: {url_teste}...")
    
    try:
        # Chama o motor de captura
        imagem_bytes = await capturar_tela_pagina(url_teste)
        
        # Salva o resultado em um arquivo PNG local
        with open("resultado_teste.png", "wb") as f:
            f.write(imagem_bytes)
            
        print("Sucesso! Verifique o arquivo 'resultado_teste.png' na sua pasta.")
        print(f"Tamanho do arquivo: {len(imagem_bytes)} bytes")
        
    except Exception as e:
        print(f"Erro durante a captura: {e}")

# Executa o loop assíncrono
if __name__ == "__main__":
    asyncio.run(rodar_teste())