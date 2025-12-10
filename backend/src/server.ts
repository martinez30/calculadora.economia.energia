import express, { Request, Response } from 'express';
import cors from 'cors';
import tarifasRoutes from './routes/tarifas.routes';
import calculadoraRoutes from './routes/calculadora-complexa.routes';
import { initializeDatabase } from './db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/tarifas', tarifasRoutes);

// Rotas da API calculadora complexa
app.use('/api/calculadora', calculadoraRoutes);

// Rota 404
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo deu errado!' });
});

// Inicializar banco de dados e depois iniciar servidor
async function startServer() {
  try {
    // Inicializar banco de dados primeiro
    await initializeDatabase();
    console.log('✅ Banco de dados inicializado com sucesso');

    // Depois iniciar o servidor
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}/api/tarifas`);
      console.log(`🧮 API Calculadora disponível em http://localhost:${PORT}/api/calculadora`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

// Iniciar o servidor
startServer();