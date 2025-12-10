export interface Calculo {
  uf: string;
  distribuidora_id?: number;
  valor_fatura: number;
}

export interface ResultadoCalculo {
  tarifa_base: number,
  tarifa_consumo_final: number,
  tarifa_compensacao: number,
  consumo_medio: number,
  consumo_compensavel: number,
  compensacao: number,
  economia: number,
  detalhes: {
    icms: number,
    isento_icms_te: boolean,
    isento_icms_tusd: boolean,
    tarifa_te: number,
    tarifa_tusd: number,
    custo_disponibilidade: number,
    desconto: number,
    valor_fatura: number
  }
}