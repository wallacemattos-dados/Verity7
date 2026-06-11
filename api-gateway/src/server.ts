import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes';
import captureRoutes from './routes/captureRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 

app.use(express.json()); 

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'API Gateway rodando!' });
});

app.use('/api/users', userRoutes);

app.use('/api', captureRoutes);

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});