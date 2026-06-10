import hashlib

def gerar_hash_sha256(conteudo: bytes) -> str:
    """Gera o hash criptográfico do arquivo para garantir integridade jurídica."""
    return hashlib.sha256(conteudo).hexdigest()