
export default function Hero() {
  return (
    <div 
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://readdy.ai/api/search-image?query=Earth%20from%20space%20showing%20weather%20patterns%2C%20satellite%20view%20of%20planet%20with%20swirling%20clouds%2C%20atmospheric%20data%20visualization%2C%20blue%20planet%20with%20white%20clouds%2C%20space%20technology%20monitoring%20climate%2C%20NASA%20Earth%20observation%20satellite%20imagery%2C%20beautiful%20cosmic%20view%20of%20Earths%20atmosphere&width=1920&height=1080&seq=hero-earth&orientation=landscape')`
      }}
    >
      <div className="text-center text-white px-4 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Painel Climático
          <span className="block text-blue-300">NASA Earth</span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
          Explore dados de observação da Terra da NASA e analise probabilidades de condições climáticas específicas para qualquer local e período do ano
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <i className="ri-temp-hot-line mr-2"></i>
            Temperatura
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <i className="ri-rainy-line mr-2"></i>
            Precipitação
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <i className="ri-windy-line mr-2"></i>
            Vento
          </div>
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
            <i className="ri-sun-line mr-2"></i>
            Radiação Solar
          </div>
        </div>
      </div>
    </div>
  );
}
