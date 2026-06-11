import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../config/supabase';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome_completo, email, password, cpf, role, oab } = req.body;

    if (!nome_completo || !email || !password || !cpf) {
      res.status(400).json({ error: 'Nome completo, email, senha e CPF são obrigatórios.' });
      return;
    }

    const userRole = role === 'advogado' ? 'advogado' : 'comum';
    
    if (userRole === 'advogado' && !oab) {
      res.status(400).json({ error: 'O número da OAB é obrigatório para o cadastro de advogados.' });
      return;
    }

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    const { data, error } = await supabase
      .from('users')
      .insert([
        { 
          nome_completo,
          email, 
          password_hash, 
          cpf,
          role: userRole,
          oab: userRole === 'advogado' ? oab : null 
        }
      ])
      .select('id, nome_completo, email, role, created_at')
      .single();

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: data
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor do API Gateway.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios.' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'E-mail ou senha inválidos.' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET não configurado no arquivo .env');
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      jwtSecret, 
      { 
        expiresIn: '2h'
      }
    );

    res.status(200).json({
      message: 'Login realizado com sucesso!',
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno no servidor do API Gateway.' });
  }
};