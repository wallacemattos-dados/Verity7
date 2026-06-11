import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# 1. Localiza o arquivo .env na raiz do projeto (dois níveis acima de db/repository.py)
#    repository.py está em servico-captura/db/repository.py
#    a raiz é servico-captura/
env_path = Path(__file__).parent.parent / '.env'

# 2. Carrega explicitamente o arquivo .env
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
    print(f"✅ .env carregado de: {env_path}")
else:
    print(f"❌ Arquivo .env não encontrado em: {env_path}")

# 3. Obtém as variáveis
URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

# 4. Validação clara (evita o erro "supabase_url is required" sem mistério)
if not URL:
    raise ValueError("SUPABASE_URL não encontrada no ambiente ou no arquivo .env")
if not KEY:
    raise ValueError("SUPABASE_KEY não encontrada no ambiente ou no arquivo .env")

# 5. Cria o cliente Supabase
supabase: Client = create_client(URL, KEY)


def salvar_log_auditoria(titulo: str, url_alvo: str, hash_img: str, usuario_id: str) -> dict:
    try:
        dados = {
            "titulo": titulo,
            "url_alvo": url_alvo, 
            "hash_img": hash_img,
            "usuario_id": usuario_id
        }
        
        resposta = supabase.table("auditoria").insert(dados).execute()
        
        if resposta.data and len(resposta.data) > 0:
            return resposta.data[0]
        
        return {}
        
    except Exception as e:
        print(f"Erro crítico ao salvar no Supabase: {e}")
        return {}