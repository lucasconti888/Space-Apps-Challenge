
interface DataExportProps {
  data: any;
  location: { lat: number; lng: number; name: string };
  date: string;
}

export default function DataExport({ data, location, date }: DataExportProps) {
  const exportToJSON = () => {
    const exportData = {
      location: location,
      date: date,
      timestamp: new Date().toISOString(),
      weather_data: data
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `nasa_weather_data_${location.name.replace(/\s+/g, '_')}_${date}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportToCSV = () => {
    const csvData = [];
    
    // Header
    csvData.push([
      'Dia',
      'Temperatura (°C)',
      'Temp Min (°C)',
      'Temp Max (°C)',
      'Precipitação (mm)',
      'Velocidade Vento (km/h)',
      'Radiação Solar (W/m²)'
    ]);
    
    // Data rows
    for (let i = 0; i < data.temperature.historical.length; i++) {
      csvData.push([
        data.temperature.historical[i]?.day || i + 1,
        data.temperature.historical[i]?.temp?.toFixed(1) || '',
        data.temperature.historical[i]?.min?.toFixed(1) || '',
        data.temperature.historical[i]?.max?.toFixed(1) || '',
        data.precipitation.historical[i]?.precipitation?.toFixed(1) || '',
        data.wind.historical[i]?.speed?.toFixed(1) || '',
        data.solar_radiation.historical[i]?.radiation?.toFixed(0) || ''
      ]);
    }
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    
    const exportFileDefaultName = `nasa_weather_data_${location.name.replace(/\s+/g, '_')}_${date}.csv`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const generateReport = () => {
    const reportContent = `
RELATÓRIO CLIMÁTICO NASA - ${location.name}
Data de Análise: ${new Date(date).toLocaleDateString('pt-BR')}
Coordenadas: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}
Gerado em: ${new Date().toLocaleString('pt-BR')}

=== RESUMO EXECUTIVO ===

Temperatura:
- Atual: ${data.temperature.current}°C
- Média: ${data.temperature.average}°C
- Mínima: ${data.temperature.min}°C
- Máxima: ${data.temperature.max}°C
- Probabilidade > 30°C: ${data.temperature.probability_above_30}%

Precipitação:
- Atual: ${data.precipitation.current}mm
- Média: ${data.precipitation.average}mm
- Probabilidade de chuva: ${data.precipitation.probability_rain}%
- Probabilidade chuva forte: ${data.precipitation.probability_heavy_rain}%

Vento:
- Velocidade: ${data.wind.speed} km/h
- Direção: ${data.wind.direction}
- Rajadas: ${data.wind.gusts} km/h
- Probabilidade vento forte: ${data.wind.probability_strong_wind}%

Radiação Solar:
- Atual: ${data.solar_radiation.current} W/m²
- Média: ${data.solar_radiation.average} W/m²
- Índice UV: ${data.solar_radiation.uv_index}
- Probabilidade UV alto: ${data.solar_radiation.probability_high_uv}%

Qualidade do Ar:
- AQI: ${data.air_quality.aqi}
- PM2.5: ${data.air_quality.pm25} μg/m³
- PM10: ${data.air_quality.pm10} μg/m³
- Status: ${data.air_quality.status}

=== ANÁLISE DE RISCOS ===

${data.temperature.probability_above_30 > 70 ? '⚠️ ALTO RISCO: Temperaturas extremas esperadas' : '✅ Temperaturas dentro da normalidade'}
${data.precipitation.probability_heavy_rain > 50 ? '⚠️ ALTO RISCO: Chuvas intensas possíveis' : '✅ Precipitação moderada'}
${data.wind.probability_strong_wind > 60 ? '⚠️ ALTO RISCO: Ventos fortes esperados' : '✅ Ventos dentro da normalidade'}
${data.solar_radiation.probability_high_uv > 80 ? '⚠️ ALTO RISCO: Radiação UV perigosa' : '✅ Radiação UV moderada'}

=== RECOMENDAÇÕES ===

${data.temperature.probability_above_30 > 70 ? '• Evite exposição prolongada ao sol\n• Mantenha-se hidratado\n• Use roupas leves e claras' : '• Condições de temperatura favoráveis'}

${data.precipitation.probability_rain > 60 ? '• Leve guarda-chuva ou capa de chuva\n• Evite áreas propensas a alagamento' : '• Baixa probabilidade de chuva'}

${data.solar_radiation.probability_high_uv > 70 ? '• Use protetor solar FPS 30+\n• Evite exposição entre 10h-16h\n• Use óculos de sol e chapéu' : '• Proteção solar básica recomendada'}

Dados baseados em observações da NASA Earth Science Division.
    `;
    
    const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(reportContent);
    const exportFileDefaultName = `relatorio_climatico_${location.name.replace(/\s+/g, '_')}_${date}.txt`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="ri-download-line mr-3 text-blue-600"></i>
        Exportar Dados
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* JSON Export */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="text-center">
            <i className="ri-file-code-line text-4xl text-blue-600 mb-4"></i>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Dados JSON
            </h3>
            <p className="text-blue-600 text-sm mb-4">
              Formato estruturado para análise programática
            </p>
            <button
              onClick={exportToJSON}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-download-line mr-2"></i>
              Baixar JSON
            </button>
          </div>
        </div>
        
        {/* CSV Export */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="text-center">
            <i className="ri-file-excel-line text-4xl text-green-600 mb-4"></i>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Planilha CSV
            </h3>
            <p className="text-green-600 text-sm mb-4">
              Para análise em Excel ou Google Sheets
            </p>
            <button
              onClick={exportToCSV}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-download-line mr-2"></i>
              Baixar CSV
            </button>
          </div>
        </div>
        
        {/* Report Export */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="text-center">
            <i className="ri-file-text-line text-4xl text-purple-600 mb-4"></i>
            <h3 className="text-lg font-semibold text-purple-800 mb-2">
              Relatório
            </h3>
            <p className="text-purple-600 text-sm mb-4">
              Análise completa com recomendações
            </p>
            <button
              onClick={generateReport}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
            >
              <i className="ri-download-line mr-2"></i>
              Gerar Relatório
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
          <i className="ri-information-line mr-2 text-blue-600"></i>
          Sobre os Dados Exportados
        </h4>
        
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Variáveis Incluídas:</h5>
            <ul className="space-y-1">
              <li>• Temperatura (atual, mín, máx, média)</li>
              <li>• Precipitação e probabilidades</li>
              <li>• Velocidade e direção do vento</li>
              <li>• Radiação solar e índice UV</li>
              <li>• Qualidade do ar (AQI, PM2.5, PM10)</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Fonte dos Dados:</h5>
            <ul className="space-y-1">
              <li>• NASA Earth Science Division</li>
              <li>• Dados históricos de 30 anos</li>
              <li>• Resolução temporal: diária</li>
              <li>• Coordenadas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</li>
              <li>• Período: {new Date(date).toLocaleDateString('pt-BR')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
