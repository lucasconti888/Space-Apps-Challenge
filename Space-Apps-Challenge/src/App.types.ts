export type ApiResponse = {
  local: {
    bounding_box?: { lat: number; long: number };
    data_referencia?: string; // ISO
  };
  clima: {
    temperatura_ar?: { valor: number; unidade: string };
    precipitacao?: { valor: number; unidade: string; probabilidade?: number };
    neve?: { valor: number; unidade: string; probabilidade?: number };
    vento?: { valor: number; unidade: string };
    radiacao_solar?: { valor: number; unidade: string };
    umidade_do_ar?: { valor: number; unidade: string };
    umidade_do_solo?: { valor: number; unidade: string };
  };
  resumo?: string;
};