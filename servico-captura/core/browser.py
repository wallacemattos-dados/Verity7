from playwright.async_api import async_playwright

async def capturar_tela_pagina(url: str) -> bytes:
    """Acessa a URL informada e retorna os bytes do screenshot."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        try:
            # Muda para "load" e aumenta o tempo limite para 60 segundos
            await page.goto(url, wait_until="load", timeout=60000)
            
            # Adiciona uma pausa forçada de 2 segundos para dar tempo 
            # de banners e imagens "lazy-load" terminarem de aparecer na tela
            await page.wait_for_timeout(2000)
            
            # Tira o print da tela inteira
            screenshot_bytes = await page.screenshot(full_page=True)
            
            return screenshot_bytes
            
        finally:
            # O bloco finally garante que o navegador será fechado mesmo se der erro
            await browser.close()