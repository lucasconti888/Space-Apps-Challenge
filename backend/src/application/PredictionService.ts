import { PredictionRequestDto } from '../dto/PredictionRequestDto';
import { PredictionResponseDto } from '../dto/PredictionResponseDto';

export class PredictionService {
  static async predict(dto: PredictionRequestDto): Promise<PredictionResponseDto> {
    const { lat, long, date } = dto;

    return {
      local: {
        bounding_box: { lat, long },
        data_referencia: date,
      },
      clima: {
        temperatura_ar: { valor: 298.5, unidade: 'K' },
        precipitacao: { valor: 0.00025, unidade: 'kg m-2 s-1' },
        vento: { valor: 3.2, unidade: 'm/s' },
        radiacao_solar: { valor: 220, unidade: 'W m-2' },
        'umidade do ar': { valor: 0.75, unidade: '%' },
        'umidade do solo': { valor: 0.42, unidade: '%' },
      },
    };
  }
}
