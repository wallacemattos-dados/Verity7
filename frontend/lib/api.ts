export async function register(userData: {
  nome_completo: string;
  email: string;
  password: string;
  cpf: string;
  role: string;
  oab?: string;
}) {
  const response = await fetch('http://localhost:3000/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro no cadastro');
  return data;
}

export async function login(credentials: {
  email: string;
  password: string;
}) {
  const response = await fetch('http://localhost:3000/api/users/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Erro no login');
  return data;
}

export type Registro = {
  id: string;
  titulo: string;
  url_alvo: string;
  hash_img: string;
  usuario_id: string;
  created_at: string;
};

export async function getCaptures(token: string): Promise<Registro[]> {
  const response = await fetch('http://localhost:3000/api/captures', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao carregar o histórico de capturas.');
  }

  return response.json();
}

export type CapturaResponse = {
  id: string;
  titulo: string;
  url_alvo: string;
  hash_img: string;
  created_at: string;
  usuario_id: string;
};

export async function solicitarCaptura(
  token: string,
  dados: { titulo: string; url_alvo: string; usuario_id: string } // <-- Adicionado aqui
): Promise<CapturaResponse> {
  
  // O TRADUTOR: Colocamos o usuario_id no pacote final
  const payloadPython = {
    titulo: dados.titulo,
    url: dados.url_alvo,
    usuario_id: dados.usuario_id // <-- Adicionado aqui
  };

  const response = await fetch('http://localhost:3000/api/capture', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payloadPython),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao processar a captura do site.');
  }

  return response.json();
}