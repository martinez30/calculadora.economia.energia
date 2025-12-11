import { 
  getEstadoByUF, 
  getDistribuidoraByUF, 
  getDistribuidoraById,
  getCustoDisponibilidade 
} from '../db';
import { 
  CalculoComplexoRequest, 
  CalculoComplexoResponse 
} from '../models/Tarifa.model';

export class CalculadoraComplexaService {
  
  /**
   * Calcula a tarifa base (tarifa / 1000)
   */
  private calcularTarifaBase(tarifaTe: number, tarifaTusd: number): number {
    const tarifaTotal = tarifaTe + tarifaTusd; // Em R$/MWh
    return tarifaTotal / 1000; // Converte para R$/kWh
  }

  /**
   * Calcula a tarifa de consumo final
   * tarifa_base / ((1-ICMS)*(1-5%))
   */
  private calcularTarifaConsumoFinal(tarifaBase: number, icms: number): number {
    const fatorICMS = 1 - icms;
    const fatorOutros = 1 - 0.05; // 5% de outros encargos
    return tarifaBase / (fatorICMS * fatorOutros);
  }

  /**
   * Calcula tarifa TE ajustada para isenção de ICMS
   */
  private calcularTarifaTeAjustada(
    tarifaTe: number, // Em R$/MWh
    icms: number,
    isentoIcmsTe: boolean
  ): number {
    if (isentoIcmsTe) {
      // Aplica isenção: TE / ((1-ICMS)*(1-5%))
      const fatorICMS = 1 - icms;
      const fatorOutros = 1 - 0.05;
      return tarifaTe / (fatorICMS * fatorOutros);
    }
    return tarifaTe; // Mantém o valor original
  }

  /**
   * Calcula tarifa TUSD ajustada para isenção de ICMS
   */
  private calcularTarifaTusdAjustada(
    tarifaTusd: number, // Em R$/MWh
    icms: number,
    isentoIcmsTusd: boolean
  ): number {
    if (isentoIcmsTusd) {
      // Aplica isenção: TUSD / ((1-ICMS)*(1-5%))
      const fatorICMS = 1 - icms;
      const fatorOutros = 1 - 0.05;
      return tarifaTusd / (fatorICMS * fatorOutros);
    }
    return tarifaTusd; // Mantém o valor original
  }

  

  /**
   * Calcula a tarifa de compensação (TE + TUSD ajustadas) em R$/kWh
   */
  private calcularTarifaCompensacao(
    tarifaTeAjustada: number,
    tarifaTusdAjustada: number
  ): number {
    const totalMWh = tarifaTeAjustada + tarifaTusdAjustada;
    return totalMWh / 1000; // Converte para R$/kWh
  }

  /**
   * Executa o cálculo complexo completo
   */
  async calcular(request: CalculoComplexoRequest): Promise<CalculoComplexoResponse> {
    try {
      // 1. Buscar dados do estado
      const estado = await getEstadoByUF(request.uf);
      if (!estado) {
        throw new Error(`Estado ${request.uf} não encontrado`);
      }

      // 2. Buscar distribuidora
      let distribuidora;
      if (request.distribuidora_id) {
        distribuidora = await getDistribuidoraById(request.distribuidora_id);
      } else {
        const distribuidoras = await getDistribuidoraByUF(request.uf);
        distribuidora = distribuidoras[0]; // Pega a primeira do estado
      }

      if (!distribuidora) {
        throw new Error(`Nenhuma distribuidora encontrada para ${request.uf}`);
      }

      // 3. Calcular valores ajustados
      const isentoIcmsTe = estado.isento_icms_te === 'ISENTO';
      const isentoIcmsTusd = estado.isento_icms_tusd === 'ISENTO';
      
      const tarifaTeAjustada = this.calcularTarifaTeAjustada(
        distribuidora.tarifa_te,
        estado.icms,
        isentoIcmsTe
      );

      const tarifaTusdAjustada = this.calcularTarifaTusdAjustada(
        distribuidora.tarifa_tusd,
        estado.icms,
        isentoIcmsTusd
      );

      // 4. Calcular tarifas intermediárias
      const tarifaBase = this.calcularTarifaBase(
        distribuidora.tarifa_te,
        distribuidora.tarifa_tusd
      );

      const tarifaConsumoFinal = this.calcularTarifaConsumoFinal(
        tarifaBase,
        estado.icms
      );

      const tarifaCompensacao = this.calcularTarifaCompensacao(
        tarifaTeAjustada,
        tarifaTusdAjustada
      );

      // 5. Calcular consumo médio e compensável
      const consumoMedio = request.valor_fatura / tarifaConsumoFinal;
      const custoDisponibilidade = await getCustoDisponibilidade(consumoMedio);
      const consumoCompensavel = Math.max(0, consumoMedio - custoDisponibilidade);

      // 6. Calcular compensação e economia
      const compensacao = consumoCompensavel * tarifaCompensacao;
      const economia = compensacao * 0.20; // 20% de desconto

      // 7. Montar resposta
      const response: CalculoComplexoResponse = {
        tarifa_base: Number(tarifaBase.toFixed(4)),
        tarifa_consumo_final: Number(tarifaConsumoFinal.toFixed(4)),
        tarifa_compensacao: Number(tarifaCompensacao.toFixed(4)),
        consumo_medio: Number(consumoMedio.toFixed(2)),
        consumo_compensavel: Number(consumoCompensavel.toFixed(2)),
        compensacao: Number(compensacao.toFixed(2)),
        economia: Number(economia.toFixed(2)),
        detalhes: {
          icms: estado.icms,
          isento_icms_te: isentoIcmsTe,
          isento_icms_tusd: isentoIcmsTusd,
          tarifa_te: Number((tarifaTeAjustada / 1000).toFixed(4)), // Converte para R$/kWh
          tarifa_tusd: Number((tarifaTusdAjustada / 1000).toFixed(4)), // Converte para R$/kWh
          custo_disponibilidade: custoDisponibilidade,
          desconto: 0.20,
          valor_fatura: request.valor_fatura
        }
      };

      return response;

    } catch (error) {
      console.error('Erro no serviço de cálculo complexo:', error);
      throw error;
    }
  }

  /**
   * Valida os dados de entrada
   */
  validarRequest(request: CalculoComplexoRequest): string[] {
    const errors: string[] = [];

    if (!request.uf || request.uf.length !== 2) {
      errors.push('UF deve ter 2 caracteres (ex: GO, SP)');
    }

    if (!request.valor_fatura || request.valor_fatura <= 0) {
      errors.push('Valor da fatura deve ser maior que zero');
    }

    if (request.valor_fatura && request.valor_fatura > 100000) {
      errors.push('Valor da fatura muito alto (máximo: R$ 100.000)');
    }

    return errors;
  }
}