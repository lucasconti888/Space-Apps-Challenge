
interface ProbabilityCardsProps {
  data: any;
}

export default function ProbabilityCards({ data }: ProbabilityCardsProps) {
  const cards = [
    {
      title: 'Temperatura Extrema',
      subtitle: 'Acima de 30°C',
      probability: data.temperature.probability_above_30,
      icon: 'ri-temp-hot-line',
      color: 'red',
      description: 'Probabilidade de temperaturas acima de 30°C'
    },
    {
      title: 'Precipitação',
      subtitle: 'Chuva Moderada',
      probability: data.precipitation.probability_rain,
      icon: 'ri-rainy-line',
      color: 'blue',
      description: 'Chance de precipitação significativa'
    },
    {
      title: 'Vento Forte',
      subtitle: 'Acima de 25 km/h',
      probability: data.wind.probability_strong_wind,
      icon: 'ri-windy-line',
      color: 'green',
      description: 'Probabilidade de ventos fortes'
    },
    {
      title: 'UV Alto',
      subtitle: 'Índice UV > 7',
      probability: data.solar_radiation.probability_high_uv,
      icon: 'ri-sun-line',
      color: 'yellow',
      description: 'Risco de radiação UV elevada'
    },
    {
      title: 'Qualidade do Ar',
      subtitle: 'Condições Ruins',
      probability: data.air_quality.probability_unhealthy,
      icon: 'ri-leaf-line',
      color: 'purple',
      description: 'Chance de qualidade do ar prejudicial'
    }
  ];

  const getColorClasses = (color: string, probability: number) => {
    const intensity = probability > 70 ? '600' : probability > 40 ? '500' : '400';
    
    switch (color) {
      case 'red':
        return {
          bg: `bg-red-${intensity}`,
          text: 'text-white',
          icon: 'text-red-100'
        };
      case 'blue':
        return {
          bg: `bg-blue-${intensity}`,
          text: 'text-white',
          icon: 'text-blue-100'
        };
      case 'green':
        return {
          bg: `bg-green-${intensity}`,
          text: 'text-white',
          icon: 'text-green-100'
        };
      case 'yellow':
        return {
          bg: `bg-yellow-${intensity}`,
          text: 'text-white',
          icon: 'text-yellow-100'
        };
      case 'purple':
        return {
          bg: `bg-purple-${intensity}`,
          text: 'text-white',
          icon: 'text-purple-100'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-white',
          icon: 'text-gray-100'
        };
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Probabilidades Climáticas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cards.map((card, index) => {
          const colors = getColorClasses(card.color, card.probability);
          
          return (
            <div
              key={index}
              className={`${colors.bg} rounded-xl p-6 ${colors.text} transform hover:scale-105 transition-transform cursor-pointer`}
            >
              <div className="flex items-center justify-between mb-3">
                <i className={`${card.icon} text-2xl ${colors.icon}`}></i>
                <span className="text-2xl font-bold">
                  {card.probability}%
                </span>
              </div>
              
              <h4 className="font-semibold text-lg mb-1">
                {card.title}
              </h4>
              
              <p className="text-sm opacity-90 mb-3">
                {card.subtitle}
              </p>
              
              <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${card.probability}%` }}
                ></div>
              </div>
              
              <p className="text-xs opacity-75">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">
          <i className="ri-information-line mr-2"></i>
          Como Interpretar
        </h4>
        <p className="text-gray-600 text-sm">
          As probabilidades são baseadas em dados históricos da NASA para o mesmo período do ano. 
          Valores acima de 70% indicam alta probabilidade, entre 40-70% probabilidade moderada, 
          e abaixo de 40% baixa probabilidade.
        </p>
      </div>
    </div>
  );
}
