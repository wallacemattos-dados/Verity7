from playwright.async_api import async_playwright

async def capturar_tela_pagina(url: str) -> bytes:
    """Acessa a URL, rola a página para carregar as imagens e retorna os bytes."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Configurar viewport padrão (ajuda no layout de sites responsivos)
        page = await browser.new_page(viewport={"width": 1280, "height": 800})
        
        try:
            await page.goto(url, wait_until="load", timeout=60000)
            
            # Injeta um script JavaScript para rolar a página até o fim
            await page.evaluate("""
                async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        const distance = 200; // Quantidade de pixels rolados por vez
                        const timer = setInterval(() => {
                            const scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;

                            // Se chegou no final da página, para o timer
                            if (totalHeight >= scrollHeight - window.innerHeight) {
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100); // Frequência do scroll (100 milissegundos)
                    });
                }
            """)
            
            # Dá um tempo extra de 2 segundos para o navegador renderizar as imagens que foram requisitadas
            await page.wait_for_timeout(2000)
            
            # Volta para o topo da página antes de tirar o print (garante que overlays fiquem no lugar certo)
            await page.evaluate("window.scrollTo(0, 0)")
            
            # Tira o print da tela inteira
            screenshot_bytes = await page.screenshot(full_page=True)
            
            return screenshot_bytes
            
        finally:
            await browser.close()