
import { useState } from 'react';

interface HeatMapProps {
  data: any;
  location: { lat: number; lng: number; name: string };
}

export default function HeatMap({ data, location }: HeatMapProps) {
  const [selectedMetric, setSelectedMetric] = useState('temperature');
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; value: number } | null>(null);

  // Gerar dados simulados para mapa de calor (24h x 30 dias)
  const generateHeatMapData = (metric: string) => {
    const heatData = [];
    for (let day = 1; day <= 30; day++) {
      const dayData = [];
      for (let hour = 0; hour < 24; hour++) {
        let value = 0;
        let baseValue = 0;
        let variation = 0;

        switch (metric) {
          case 'temperature':
            baseValue = data.temperature.average;
            variation = 15;
            // Variação diurna (mais quente durante o dia)
            const tempCycle = Math.sin((hour - 6) * Math.PI / 12) * 8;
            value = baseValue + tempCycle + (Math.random() - 0.5) * variation;
            break;
          case 'precipitation':
            baseValue = data.precipitation.average;
            variation = 8;
            // Mais chuva à tarde/noite
            const rainCycle = hour > 14 && hour < 22 ? 2 : 0;
            value = Math.max(0, baseValue + rainCycle + (Math.random() - 0.3) * variation);
            break;
          case 'wind':
            baseValue = data.wind.speed;
            variation = 10;
            // Vento mais forte durante o dia
            const windCycle = hour > 8 && hour < 18 ? 5 : -2;
            value = Math.max(0, baseValue + windCycle + (Math.random() - 0.5) * variation);
            break;
          case 'solar':
            baseValue = data.solar_radiation.average;
            variation = 200;
            // Radiação solar apenas durante o dia
            if (hour >= 6 && hour <= 18) {
              const solarCycle = Math.sin((hour - 6) * Math.PI / 12) * baseValue;
              value = solarCycle + (Math.random() - 0.5) * variation;
            } else {
              value = 0;
            }
            break;
          case 'air_quality':
            baseValue = data.air_quality.aqi;
            variation = 30;
            // Pior qualidade do ar durante rush hours
            const aqiCycle = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19) ? 20 : 0;
            value = Math.max(0, baseValue + aqiCycle + (Math.random() - 0.5) * variation);
            break;
        }

        dayData.push({
          day,
          hour,
          value: Math.max(0, value)
        });
      }
      heatData.push(dayData);
    }
    return heatData;
  };

  const heatMapData = generateHeatMapData(selectedMetric);

  // Calcular min/max para normalização das cores
  const allValues = heatMapData.flat().map(cell => cell.value);
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  const getColorIntensity = (value: number) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    return Math.round(normalized * 100);
  };

  const getColorClass = (value: number, metric: string) => {
    const intensity = getColorIntensity(value);
    
    if (intensity === 0) return 'bg-gray-100';
    
    switch (metric) {
      case 'temperature':
        if (intensity < 20) return 'bg-blue-200';
        if (intensity < 40) return 'bg-blue-400';
        if (intensity < 60) return 'bg-yellow-400';
        if (intensity < 80) return 'bg-orange-500';
        return 'bg-red-600';
      case 'precipitation':
        if (intensity < 20) return 'bg-blue-100';
        if (intensity < 40) return 'bg-blue-300';
        if (intensity < 60) return 'bg-blue-500';
        if (intensity < 80) return 'bg-blue-700';
        return 'bg-blue-900';
      case 'wind':
        if (intensity < 20) return 'bg-green-100';
        if (intensity < 40) return 'bg-green-300';
        if (intensity < 60) return 'bg-green-500';
        if (intensity < 80) return 'bg-green-700';
        return 'bg-green-900';
      case 'solar':
        if (intensity < 20) return 'bg-yellow-100';
        if (intensity < 40) return 'bg-yellow-300';
        if (intensity < 60) return 'bg-yellow-500';
        if (intensity < 80) return 'bg-orange-500';
        return 'bg-red-500';
      case 'air_quality':
        if (intensity < 20) return 'bg-green-200';
        if (intensity < 40) return 'bg-yellow-300';
        if (intensity < 60) return 'bg-orange-400';
        if (intensity < 80) return 'bg-red-500';
        return 'bg-purple-600';
      default:
        return 'bg-gray-300';
    }
  };

  const getUnit = (metric: string) => {
    switch (metric) {
      case 'temperature': return '°C';
      case 'precipitation': return 'mm';
      case 'wind': return 'km/h';
      case 'solar': return 'W/m²';
      case 'air_quality': return 'AQI';
      default: return '';
    }
  };

  const metrics = [
    { id: 'temperature', label: 'Temperatura', icon: 'ri-temp-hot-line' },
    { id: 'precipitation', label: 'Precipitação', icon: 'ri-rainy-line' },
    { id: 'wind', label: 'Vento', icon: 'ri-windy-line' },
    { id: 'solar', label: 'Radiação Solar', icon: 'ri-sun-line' },
    { id: 'air_quality', label: 'Qualidade do Ar', icon: 'ri-leaf-line' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Mapa de Calor Climático - {location.name}
        </h2>
        <p className="text-gray-600">
          Visualização de dados por hora ao longo de 30 dias
        </p>
      </div>

      {/* Seletor de Métrica */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.id}
              onClick={() => setSelectedMetric(metric.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                selectedMetric === metric.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`${metric.icon} mr-2`}></i>
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mapa de Calor */}
      <div className="relative">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Header com horas */}
            <div className="flex mb-2">
              <div className="w-12 h-6"></div>
              {Array.from({ length: 24 }, (_, hour) => (
                <div key={hour} className="w-6 h-6 text-xs text-gray-500 text-center">
                  {hour.toString().padStart(2, '0')}
                </div>
              ))}
            </div>

            {/* Dados do mapa de calor */}
            {heatMapData.map((dayData, dayIndex) => (
              <div key={dayIndex} className="flex mb-1">
                <div className="w-12 h-6 text-xs text-gray-500 text-right pr-2 flex items-center justify-end">
                  {dayIndex + 1}
                </div>
                {dayData.map((cell, hourIndex) => (
                  <div
                    key={hourIndex}
                    className={`w-6 h-6 ${getColorClass(cell.value, selectedMetric)} cursor-pointer transition-all duration-200 hover:scale-110 hover:z-10 relative`}
                    onMouseEnter={() => setHoveredCell(cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                  >
                    {hoveredCell && 
                     hoveredCell.day === cell.day && 
                     hoveredCell.hour === cell.hour && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-20 whitespace-nowrap">
                        <div className="font-semibold">
                          Dia {cell.day}, {cell.hour.toString().padStart(2, '0')}:00
                        </div>
                        <div>
                          {cell.value.toFixed(1)} {getUnit(selectedMetric)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Dias (vertical)</span> × <span className="font-medium">Horas (horizontal)</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Baixo</span>
            <div className="flex">
              {selectedMetric === 'temperature' && (
                <>
                  <div className="w-4 h-4 bg-blue-200"></div>
                  <div className="w-4 h-4 bg-blue-400"></div>
                  <div className="w-4 h-4 bg-yellow-400"></div>
                  <div className="w-4 h-4 bg-orange-500"></div>
                  <div className="w-4 h-4 bg-red-600"></div>
                </>
              )}
              {selectedMetric === 'precipitation' && (
                <>
                  <div className="w-4 h-4 bg-blue-100"></div>
                  <div className="w-4 h-4 bg-blue-300"></div>
                  <div className="w-4 h-4 bg-blue-500"></div>
                  <div className="w-4 h-4 bg-blue-700"></div>
                  <div className="w-4 h-4 bg-blue-900"></div>
                </>
              )}
              {selectedMetric === 'wind' && (
                <>
                  <div className="w-4 h-4 bg-green-100"></div>
                  <div className="w-4 h-4 bg-green-300"></div>
                  <div className="w-4 h-4 bg-green-500"></div>
                  <div className="w-4 h-4 bg-green-700"></div>
                  <div className="w-4 h-4 bg-green-900"></div>
                </>
              )}
              {selectedMetric === 'solar' && (
                <>
                  <div className="w-4 h-4 bg-yellow-100"></div>
                  <div className="w-4 h-4 bg-yellow-300"></div>
                  <div className="w-4 h-4 bg-yellow-500"></div>
                  <div className="w-4 h-4 bg-orange-500"></div>
                  <div className="w-4 h-4 bg-red-500"></div>
                </>
              )}
              {selectedMetric === 'air_quality' && (
                <>
                  <div className="w-4 h-4 bg-green-200"></div>
                  <div className="w-4 h-4 bg-yellow-300"></div>
                  <div className="w-4 h-4 bg-orange-400"></div>
                  <div className="w-4 h-4 bg-red-500"></div>
                  <div className="w-4 h-4 bg-purple-600"></div>
                </>
              )}
            </div>
            <span className="text-xs text-gray-500">Alto</span>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {minValue.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Mínimo</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {maxValue.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Máximo</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {(allValues.reduce((sum, val) => sum + val, 0) / allValues.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Média</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">
              {getUnit(selectedMetric)}
            </div>
            <div className="text-sm text-gray-600">Unidade</div>
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">
          <i className="ri-information-line mr-2"></i>
          Como Interpretar o Mapa de Calor
        </h4>
        <p className="text-blue-700 text-sm">
          Cada célula representa um valor específico para uma hora do dia em um determinado dia. 
          Cores mais intensas indicam valores mais altos. Passe o mouse sobre as células para ver valores detalhados.
          Os padrões revelam tendências sazonais e ciclos diários dos dados climáticos.
        </p>
      </div>
    </div>
  );
}
