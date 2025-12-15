import { Request, Response } from 'express';
import { queryAll, queryGet } from '../db';
import { 
  TarifaRow, 
  CalculoRequest, 
  CalculoResponse 
} from '../models/Tarifa.model';

export class TarifasController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const rows = await queryAll<TarifaRow>('SELECT * FROM tarifas ORDER BY estado');
      res.json(rows || []);
    } catch (error) {
      console.error('Erro em getAll:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getComDistribuidoras(req: Request, res: Response): Promise<void> {
    try {
      const query = `
        SELECT DISTINCT t.*
        FROM tarifas t
        INNER JOIN distribuidoras d ON t.uf = d.uf
        ORDER BY t.estado
      `;
      const rows = await queryAll<TarifaRow>(query);
      res.json(rows || []);
    } catch (error) {
      console.error('Erro em getComDistribuidoras:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async getByUF(req: Request, res: Response): Promise<void> {
    try {
      const { uf } = req.params;
      
      if (!uf || uf.length !== 2) {
        res.status(400).json({ error: 'UF deve ter 2 caracteres (ex: GO, SP)' });
        return;
      }
      
      const row = await queryGet<TarifaRow>('SELECT * FROM tarifas WHERE uf = ?', [uf.toUpperCase()]);
      
      if (!row) {
        res.status(404).json({ error: `Tarifa não encontrada para UF: ${uf}` });
        return;
      }
      
      res.json(row);
    } catch (error) {
      console.error('Erro em getByUF:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async calcularEconomia(req: Request, res: Response): Promise<void> {
    try {
      const { uf, consumoMensalKwh, valorContaAtual }: CalculoRequest = req.body;
      
      if (!uf || uf.length !== 2) {
        res.status(400).json({ error: 'UF deve ter 2 caracteres (ex: GO, SP)' });
        return;
      }
      
      if (!consumoMensalKwh || consumoMensalKwh <= 0) {
        res.status(400).json({ error: 'Consumo mensal deve ser maior que zero' });
        return;
      }
      
      if (valorContaAtual && valorContaAtual < 0) {
        res.status(400).json({ error: 'Valor da conta atual não pode ser negativo' });
        return;
      }
      
      const row = await queryGet<TarifaRow>('SELECT * FROM tarifas WHERE uf = ?', [uf.toUpperCase()]);
      
      if (!row) {
        res.status(404).json({ error: `Tarifa não encontrada para UF: ${uf}` });
        return;
      }
      
      const tarifa = row.tarifa_kwh;
      const custoMensalEnergiaLimpa = consumoMensalKwh * tarifa;
      const economiaMensal = valorContaAtual ? valorContaAtual - custoMensalEnergiaLimpa : 0;
      const economiaAnual = economiaMensal * 12;
      
      const response: CalculoResponse = {
        tarifa_kwh: tarifa,
        custoMensalEnergiaLimpa: Number(custoMensalEnergiaLimpa.toFixed(2)),
        economiaMensal: Number(Math.max(economiaMensal, 0).toFixed(2)),
        economiaAnual: Number(Math.max(economiaAnual, 0).toFixed(2)),
        consumoMensalKwh: Number(consumoMensalKwh)
      };
      
      res.json(response);
    } catch (error) {
      console.error('Erro em calcularEconomia:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}