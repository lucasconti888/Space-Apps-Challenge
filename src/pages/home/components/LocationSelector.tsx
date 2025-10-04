
import { useState, useEffect } from 'react';

interface LocationSelectorProps {
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  onDateSelect: (date: string) => void;
  selectedLocation: { lat: number; lng: number; name: string } | null;
  selectedDate: string;
}

export default function LocationSelector({ 
  onLocationSelect, 
  onDateSelect, 
  selectedLocation, 
  selectedDate 
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(false);

  // Simular busca de locais
  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    
    // Simulação de resultados de busca
    setTimeout(() => {
      const mockResults = [
        { name: `${query} - São Paulo, Brasil`, lat: -23.5505, lng: -46.6333 },
        { name: `${query} - Rio de Janeiro, Brasil`, lat: -22.9068, lng: -43.1729 },
        { name: `${query} - Brasília, Brasil`, lat: -15.7942, lng: -47.8822 },
        { name: `${query} - Salvador, Brasil`, lat: -12.9714, lng: -38.5014 },
        { name: `${query} - Fortaleza, Brasil`, lat: -3.7319, lng: -38.5267 }
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 500);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleLocationSelect = (location: any) => {
    onLocationSelect(location);
    setSearchResults([]);
    setSearchQuery(location.name);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        Selecione Localização e Data
      </h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Seleção de Local */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            <i className="ri-map-pin-line mr-2 text-blue-600"></i>
            Localização
          </label>
          
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o nome da cidade..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
            />
            
            {isSearching && (
              <div className="absolute right-3 top-3">
                <i className="ri-loader-4-line animate-spin text-blue-600"></i>
              </div>
            )}
            
            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 text-sm"
                  >
                    <i className="ri-map-pin-line mr-2 text-blue-600"></i>
                    {result.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap cursor-pointer"
            >
              <i className="ri-map-line mr-2"></i>
              {showMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
            </button>
          </div>
          
          {showMap && (
            <div className="mt-4 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.1975!2d-46.6333!3d-23.5505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjPCsDMzJzAxLjgiUyA0NsKwMzgnMDAuMCJX!5e0!3m2!1spt!2sbr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '8px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          )}
        </div>
        
        {/* Seleção de Data */}
        <div>
          <label className="block text-lg font-semibold text-gray-700 mb-3">
            <i className="ri-calendar-line mr-2 text-blue-600"></i>
            Período de Análise
          </label>
          
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateSelect(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
          />
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Dica:</h4>
            <p className="text-blue-700 text-sm">
              Selecione uma data para analisar as probabilidades climáticas históricas para esse período do ano.
            </p>
          </div>
        </div>
      </div>
      
      {selectedLocation && selectedDate && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center text-green-800">
            <i className="ri-check-line mr-2 text-xl"></i>
            <span className="font-semibold">Configuração Completa</span>
          </div>
          <p className="text-green-700 mt-1 text-sm">
            Local: {selectedLocation.name} | Data: {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}
