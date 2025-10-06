// export type ApiResponse = {
//   local: {
//     bounding_box?: { lat: number; long: number };
//     data_referencia?: string; // ISO
//   };
//   clima: {
//     temperatura_ar?: { valor: number; unidade: string };
//     precipitacao?: { valor: number; unidade: string; probabilidade?: number };
//     neve?: { valor: number; unidade: string; probabilidade?: number };
//     vento?: { valor: number; unidade: string };
//     radiacao_solar?: { valor: number; unidade: string };
//     umidade_do_ar?: { valor: number; unidade: string };
//     umidade_do_solo?: { valor: number; unidade: string };
//   };
//   resumo?: string;
// };

export interface ApiResponse {
  current?: {
    temperature_2m?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    [key: string]: any;
  };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    [key: string]: any;
  };
  [key: string]: any;
}