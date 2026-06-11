import os
from supabase import create_client, Client

URL = os.getenv("SUPABASE_URL")
KEY = os.getenv("SUPABASE_KEY")

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