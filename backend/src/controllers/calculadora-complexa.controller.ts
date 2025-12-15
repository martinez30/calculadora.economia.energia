import { Request, Response } from 'express';
import { CalculadoraComplexaService } from '../services/calculadora-complexa.service';
import { CalculoComplexoRequest } from '../models/Tarifa.model';

export class CalculadoraComplexaController {
  private calculadoraService: CalculadoraComplexaService;

  constructor() {
    this.calculadoraService = new CalculadoraComplexaService();
  }

  async calcularComplexo(req: Request, res: Response): Promise<void> {
    try {
      const request: CalculoComplexoRequest = req.body;

      const errors = this.calculadoraService.validarRequest(request);
      if (errors.length > 0) {
        res.status(400).json({ 
          error: 'Dados inválidos',
          details: errors 
        });
        return;
      }

      const resultado = await this.calculadoraService.calcular(request);
      res.json(resultado);
    } catch (error: any) {
      console.error('Erro no controller de cálculo complexo:', error);
      
      if (error.message.includes('não encontrado')) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ 
          error: 'Erro interno do servidor',
          message: error.message 
        });
      }
    }
  }

  async getDistribuidorasPorUF(req: Request, res: Response): Promise<void> {
    try {
      const { uf } = req.params;

      if (!uf || uf.length !== 2) {
        res.status(400).json({ error: 'UF deve ter 2 caracteres' });
        return;
      }

      const { getDistribuidoraByUF } = await import('../db');
      const distribuidoras = await getDistribuidoraByUF(uf.toUpperCase());

      res.json(distribuidoras);

    } catch (error) {
      console.error('Erro ao buscar distribuidoras:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async getCustosDisponibilidade(req: Request, res: Response): Promise<void> {
    try {
      const { getAllCustosDisponibilidade } = await import('../db');
      const custos = await getAllCustosDisponibilidade();

      res.json(custos);

    } catch (error) {
      console.error('Erro ao buscar custos de disponibilidade:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}