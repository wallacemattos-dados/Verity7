from pydantic import BaseModel, HttpUrl
from typing import Optional

class CapturaRequest(BaseModel):
    url: HttpUrl
    titulo: str
    usuario_id: str

class CapturaResponse(BaseModel):
    id_registro: str
    hash_sha256: str
    tamanho_bytes: int
    status: str