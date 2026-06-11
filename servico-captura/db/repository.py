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
    
def listar_logs_auditoria(usuario_id: str) -> list:
    """Busca todas as capturas de um usuário específico, ordenadas da mais recente para a mais antiga."""
    try:
        resposta = supabase.table("auditoria").select("*").eq("usuario_id", usuario_id).order("created_at", desc=True).execute()
        return resposta.data if resposta.data else []
    except Exception as e:
        print(f"[ERROR] Erro ao listar logs no Supabase: {e}", flush=True)
        return []

def obter_log_auditoria(registro_id: str, usuario_id: str) -> dict:
    """Busca os detalhes de uma captura específica, garantindo que pertence ao usuário logado."""
    try:
        resposta = supabase.table("auditoria").select("*").eq("id", registro_id).eq("usuario_id", usuario_id).execute()
        if resposta.data and len(resposta.data) > 0:
            return resposta.data[0]
        return None
    except Exception as e:
        print(f"[ERROR] Erro ao obter log específico no Supabase: {e}", flush=True)
        return None