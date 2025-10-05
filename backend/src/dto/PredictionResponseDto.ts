export interface PredictionResponseDto {
  local: {
    bounding_box: {
      lat: number;
      long: number;
    };
    data_referencia: string;
  };
  clima: {
    temperatura_ar: {
      valor: number;
      unidade: string;
    };
    precipitacao: {
      valor: number;
      unidade: string;
    };
    vento: {
      valor: number;
      unidade: string;
    };
    radiacao_solar: {
      valor: number;
      unidade: string;
    };
    'umidade do ar': {
      valor: number;
      unidade: string;
    };
    'umidade do solo': {
      valor: number;
      unidade: string;
    };
  };
}
