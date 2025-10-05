
interface WeatherChartProps {
  data: any[];
  type: string;
  title: string;
  unit: string;
}

export default function WeatherChart({ data, type, title, unit }: WeatherChartProps) {
  const getMaxValue = () => {
    if (type === 'temperature') {
      return Math.max(...data.map(d => Math.max(d.temp, d.max)));
    }
    if (type === 'precipitation') {
      return Math.max(...data.map(d => d.precipitation));
    }
    if (type === 'wind') {
      return Math.max(...data.map(d => d.speed));
    }
    if (type === 'solar') {
      return Math.max(...data.map(d => d.radiation));
    }
    return 100;
  };

  const maxValue = getMaxValue();

  const getBarHeight = (value: number) => {
    return (value / maxValue) * 200;
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'temperature': return 'bg-red-500';
      case 'precipitation': return 'bg-blue-500';
      case 'wind': return 'bg-green-500';
      case 'solar': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-6">{title}</h3>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-end justify-between h-64 gap-1 overflow-x-auto">
          {data.slice(0, 15).map((item, index) => {
            let value = 0;
            if (type === 'temperature') value = item.temp;
            if (type === 'precipitation') value = item.precipitation;
            if (type === 'wind') value = item.speed;
            if (type === 'solar') value = item.radiation;
            
            const height = getBarHeight(value);
            
            return (
              <div key={index} className="flex flex-col items-center min-w-0 flex-1">
                <div className="relative group">
                  <div
                    className={`${getColor(type)} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer min-w-4`}
                    style={{ height: `${height}px`, minHeight: '4px' }}
                  ></div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value.toFixed(1)} {unit}
                  </div>
                </div>
                
                <span className="text-xs text-gray-600 mt-2">
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
        
        {/* Y-axis labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-4">
          <span>0 {unit}</span>
          <span>{(maxValue / 2).toFixed(0)} {unit}</span>
          <span>{maxValue.toFixed(0)} {unit}</span>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {type === 'temperature' && data.length > 0 && 
              (data.reduce((sum, d) => sum + d.temp, 0) / data.length).toFixed(1)}
            {type === 'precipitation' && data.length > 0 && 
              (data.reduce((sum, d) => sum + d.precipitation, 0) / data.length).toFixed(1)}
            {type === 'wind' && data.length > 0 && 
              (data.reduce((sum, d) => sum + d.speed, 0) / data.length).toFixed(1)}
            {type === 'solar' && data.length > 0 && 
              (data.reduce((sum, d) => sum + d.radiation, 0) / data.length).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">Média</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {maxValue.toFixed(type === 'solar' ? 0 : 1)}
          </div>
          <div className="text-sm text-gray-600">Máximo</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {type === 'temperature' && data.length > 0 && 
              Math.min(...data.map(d => d.temp)).toFixed(1)}
            {type === 'precipitation' && data.length > 0 && 
              Math.min(...data.map(d => d.precipitation)).toFixed(1)}
            {type === 'wind' && data.length > 0 && 
              Math.min(...data.map(d => d.speed)).toFixed(1)}
            {type === 'solar' && data.length > 0 && 
              Math.min(...data.map(d => d.radiation)).toFixed(0)}
          </div>
          <div className="text-sm text-gray-600">Mínimo</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-800">
            {data.length}
          </div>
          <div className="text-sm text-gray-600">Dias</div>
        </div>
      </div>
    </div>
  );
}
