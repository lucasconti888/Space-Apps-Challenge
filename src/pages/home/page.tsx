
import { useState } from 'react';
import Hero from './components/Hero';
import LocationSelector from './components/LocationSelector';
import WeatherDashboard from './components/WeatherDashboard';
import DataExport from './components/DataExport';

export default function Home() {
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [weatherData, setWeatherData] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LocationSelector 
          onLocationSelect={setSelectedLocation}
          onDateSelect={setSelectedDate}
          selectedLocation={selectedLocation}
          selectedDate={selectedDate}
        />
        
        {selectedLocation && selectedDate && (
          <>
            <WeatherDashboard 
              location={selectedLocation}
              date={selectedDate}
              onDataUpdate={setWeatherData}
            />
            
            {weatherData && (
              <DataExport 
                data={weatherData}
                location={selectedLocation}
                date={selectedDate}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
