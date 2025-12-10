export interface Tarifa {
  id: number;
  estado: string;
  uf: string;
  tarifa_kwh: number;
  created_at: string;
}

export interface Distribuidora {
  id: number;
  uf: string;
  nome: string;
  tarifa_te: number;
  tarifa_tusd: number;
}