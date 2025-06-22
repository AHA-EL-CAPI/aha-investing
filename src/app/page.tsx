export default function Home() {
  const companies = [
    { name: "AMD", symbol: "AMD", image: "/logos/amd.png", addStroke: false },
    { name: "Alibaba", symbol: "BABA", image: "/logos/baba.png", addStroke: false },
    { name: "Apple", symbol: "AAPL", image: "/logos/aapl.png", addStroke: false },
    { name: "Bancolombia", symbol: "BCOLOMBIA", image: "/logos/bcolombia.png", addStroke: true },
    { name: "Ecopetrol", symbol: "ECOPETROL", image: "/logos/ecopetrol.png", addStroke: false },
    { name: "Nubank", symbol: "NU", image: "/logos/nu.png", addStroke: false },
    { name: "Davivienda", symbol: "PFDAVVNDA", image: "/logos/davivienda.png", addStroke: true }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <div className="max-w-9xl">
        <h1
          className="text-white bg-black px-4 py-2 rounded-lg inline-block"
          style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
        >
          AHA Investing
        </h1>
        <p className="text-gray-600 mb-10"
           style={{ fontSize: 'clamp(1rem, 3vw, 2.5rem)' }}>
          Bienvenido a la fuente más accesible y gratuita para análisis fundamentales de acciones colombianas e internacionales. Aquí encontrarás métricas clave como ingresos, utilidad neta, FCF y más.
        </p>

        {/* DASHBOARDS TITLE */}
        <h2 className="text-3xl font-bold mb-6 text-black dark:text-white">Dashboards</h2>

        {/* DASHBOARDS GRID */}
        <div className="w-full max-w-screen-xl mx-auto px-4">
          <div className="grid grid-cols-5 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5 gap-6 justify-items-center">
            {companies.map(({ name, symbol, image, addStroke }) => (
              <a key={symbol} href={`/dashboard/${symbol}`} className="group w-full flex flex-col items-center">
                <div className="w-full max-w-[180px] max-h-[180px] overflow-hidden flex items-center justify-center">
                  <img
                    src={image}
                    alt={`Dashboard ${name}`}
                    className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${
                      addStroke ? 'drop-shadow-[0_0_2px_white] drop-shadow-[0_0_2px_white]' : ''
                    }`}
                  />
                </div>
                <p className="mt-2 text-center text-lg font-medium text-black dark:text-white group-hover:underline">
                  {name}
                </p>
              </a>
            ))}

            {/* Fill empty grid cells to complete the row visually */}
            {Array.from({ length: (5 - companies.length % 5) % 5 }).map((_, i) => (
              <div key={`empty-${i}`} className="w-full h-[180px] opacity-0" />
            ))}
          </div>
        </div>

        {/* MAIN YOUTUBE IMAGE AND LINK */}
        <div className="mt-[30px] flex justify-center">
          <div className="relative w-full max-w-[1280px]">
            <img
              src="/me.png"
              alt="Alejandro señalando el canal de YouTube"
              className="w-full h-auto"
            />

            <a
              href="https://www.youtube.com/@ahainvesting"
              target="_blank"
              rel="noopener noreferrer"
              className="absolute animate-bounce transition-transform hover:scale-110"
              style={{
                top: '-5%',
                left: '65%',
                width: '30%',
                transform: 'translate(-0%, -0%)',
              }}
            >
              <img
                src="/youtube logo alone.png"
                alt="YouTube"
                className="w-full h-auto"
              />
              <span className="block text-red-600 font-bold text-xs md:text-sm text-center mt-1 animate-pulse">
                ¡Haz clic aquí!
              </span>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
