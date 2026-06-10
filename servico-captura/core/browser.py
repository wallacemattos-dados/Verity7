from playwright.async_api import async_playwright

async def capturar_tela_pagina(url: str) -> bytes:
    """Acessa a URL informada e retorna os bytes do screenshot."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        
        # Visita a página e aguarda a rede ficar ociosa para garantir o carregamento
        await page.goto(url, wait_until="networkidle")
        
        # Tira o print da tela inteira
        screenshot_bytes = await page.screenshot(full_page=True)
        
        await browser.close()
        return screenshot_bytes