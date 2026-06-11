import { Request, Response } from 'express';

export const listCaptures = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const captureServiceUrl = process.env.CAPTURE_SERVICE_URL;
    if (!captureServiceUrl) {
      throw new Error('CAPTURE_SERVICE_URL não configurado no ficheiro .env');
    }

    const response = await fetch(`${captureServiceUrl}/api/captures`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      res.status(response.status).json(errorData);
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error('[Gateway] Erro ao buscar capturas no serviço Python:', err);
    res.status(500).json({ error: 'Erro interno ao comunicar com o serviço de captura de provas.' });
  }
};

export const getCapture = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ error: 'Usuário não autenticado.' });
      return;
    }

    const captureServiceUrl = process.env.CAPTURE_SERVICE_URL;
    if (!captureServiceUrl) {
      throw new Error('CAPTURE_SERVICE_URL não configurado no ficheiro .env');
    }

    const response = await fetch(`${captureServiceUrl}/api/captures/${id}`, {
      method: 'GET',
      headers: {
        'x-user-id': userId,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      res.status(response.status).json(errorData);
      return;
    }

    const data = await response.json();
    res.status(200).json(data);

  } catch (err) {
    console.error('[Gateway] Erro ao buscar detalhe da captura no serviço Python:', err);
    res.status(500).json({ error: 'Erro interno ao comunicar com o serviço de captura de provas.' });
  }
};