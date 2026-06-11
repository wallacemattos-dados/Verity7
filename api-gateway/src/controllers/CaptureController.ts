import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const listCaptures = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('auditoria')
      .select('id, titulo, url_alvo, hash_img')
      .eq('usuario_id', userId);

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json({ registros: data ?? [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao buscar registros.' });
  }
};

export const getCapture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('auditoria')
      .select('id, titulo, url_alvo, hash_img, usuario_id')
      .eq('id', id)
      .eq('usuario_id', userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Registro não encontrado.' });
      return;
    }

    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno ao buscar registro.' });
  }
};
