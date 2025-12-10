export interface Estado {
  id: number;
  nome: string;
  uf: string;
  tarifa_kwh: number;
}

export interface Cidade {
  id: number;
  nome: string;
  estado_id: number;
}