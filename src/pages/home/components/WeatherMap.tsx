
interface WeatherMapProps {
  location: { lat: number; lng: number; name: string };
  data: any;
}

export default function WeatherMap({ location, data }: WeatherMapProps) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-800 mb-4">
        Mapa Climático - {location.name}
      </h3>
      
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg h-96 relative overflow-hidden">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d${location.lng}!3d${location.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${location.lat}%2C${location.lng}!5e0!3m2!1spt!2sbr!4v1234567890`}
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '8px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            
            {/* Overlay com informações */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center text-sm">
                <i className="ri-map-pin-line text-red-500 mr-2"></i>
                <span className="font-semibold">{location.name}</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Informações Atuais */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <i className="ri-temp-hot-line text-3xl"></i>
              <span className="text-3xl font-bold">
                {data.temperature.current}°C
              </span>
            </div>
            <div className="text-blue-100">
              <div className="flex justify-between text-sm">
                <span>Mín: {data.temperature.min}°C</span>
                <span>Máx: {data.temperature.max}°C</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <i className="ri-rainy-line text-3xl"></i>
              <span className="text-3xl font-bold">
                {data.precipitation.current}mm
              </span>
            </div>
            <div className="text-cyan-100 text-sm">
              Precipitação atual
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <i className="ri-windy-line text-3xl"></i>
              <span className="text-3xl font-bold">
                {data.wind.speed}km/h
              </span>
            </div>
            <div className="text-green-100 text-sm">
              Direção: {data.wind.direction}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <i className="ri-sun-line text-3xl"></i>
              <span className="text-3xl font-bold">
                {data.solar_radiation.uv_index}
              </span>
            </div>
            <div className="text-yellow-100 text-sm">
              Índice UV
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
