
import { useState, useEffect } from 'react';
import WeatherChart from './WeatherChart';
import ProbabilityCards from './ProbabilityCards';
import WeatherMap from './WeatherMap';
import HeatMap from './HeatMap';

interface WeatherDashboardProps {
  location: { lat: number; lng: number; name: string };
  date: string;
  onDataUpdate: (data: any) => void;
}

export default function WeatherDashboard({ location, date, onDataUpdate }: WeatherDashboardProps) {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Simular carregamento de dados da NASA
  useEffect(() => {
    setLoading(true);
    
    // Simulação de dados climáticos
    setTimeout(() => {
      const mockData = {
        temperature: {
          current: 25.4,
          min: 18.2,
          max: 32.1,
          average: 24.8,
          probability_above_30: 65,
          probability_below_10: 5,
          historical: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            temp: 20 + Math.random() * 15,
            min: 15 + Math.random() * 10,
            max: 25 + Math.random() * 15
          }))
        },
        precipitation: {
          current: 2.3,
          average: 4.1,
          probability_rain: 45,
          probability_heavy_rain: 15,
          historical: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            precipitation: Math.random() * 10
          }))
        },
        wind: {
          speed: 12.5,
          direction: 'NE',
          gusts: 18.2,
          probability_strong_wind: 25,
          historical: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            speed: 5 + Math.random() * 20
          }))
        },
        solar_radiation: {
          current: 850,
          average: 780,
          uv_index: 8,
          probability_high_uv: 70,
          historical: Array.from({ length: 30 }, (_, i) => ({
            day: i + 1,
            radiation: 600 + Math.random() * 400
          }))
        },
        air_quality: {
          aqi: 42,
          pm25: 15.2,
          pm10: 28.5,
          status: 'Boa',
          probability_unhealthy: 10
        }
      };
      
      setWeatherData(mockData);
      onDataUpdate(mockData);
      setLoading(false);
    }, 2000);
  }, [location, date, onDataUpdate]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Carregando Dados da NASA
            </h3>
            <p className="text-gray-500">
              Processando dados de observação da Terra para {location.name}...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'ri-dashboard-line' },
    { id: 'heatmap', label: 'Mapa de Calor', icon: 'ri-grid-line' },
    { id: 'temperature', label: 'Temperatura', icon: 'ri-temp-hot-line' },
    { id: 'precipitation', label: 'Precipitação', icon: 'ri-rainy-line' },
    { id: 'wind', label: 'Vento', icon: 'ri-windy-line' },
    { id: 'solar', label: 'Radiação Solar', icon: 'ri-sun-line' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-xl mb-8">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Painel Climático - {location.name}
        </h2>
        <p className="text-gray-600">
          Análise para {new Date(date).toLocaleDateString('pt-BR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4">
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`${tab.icon} mr-2`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <ProbabilityCards data={weatherData} />
            <WeatherMap location={location} data={weatherData} />
          </div>
        )}
        
        {activeTab === 'heatmap' && (
          <HeatMap data={weatherData} location={location} />
        )}
        
        {activeTab === 'temperature' && (
          <WeatherChart 
            data={weatherData.temperature.historical}
            type="temperature"
            title="Variação de Temperatura (30 dias)"
            unit="°C"
          />
        )}
        
        {activeTab === 'precipitation' && (
          <WeatherChart 
            data={weatherData.precipitation.historical}
            type="precipitation"
            title="Precipitação Histórica (30 dias)"
            unit="mm"
          />
        )}
        
        {activeTab === 'wind' && (
          <WeatherChart 
            data={weatherData.wind.historical}
            type="wind"
            title="Velocidade do Vento (30 dias)"
            unit="km/h"
          />
        )}
        
        {activeTab === 'solar' && (
          <WeatherChart 
            data={weatherData.solar_radiation.historical}
            type="solar"
            title="Radiação Solar (30 dias)"
            unit="W/m²"
          />
        )}
      </div>
    </div>
  );
}
