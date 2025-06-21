export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <div className="max-w-9xl">
        <h1
          className="text-white bg-black px-4 py-2 rounded-lg inline-block"
          style={{ fontSize: 'clamp(2rem, 6vw, 5rem)' }}
        >
          AHA Investing
        </h1>
        <p  className="text-gray-600 mb-6"
          style={{ fontSize: 'clamp(1rem, 3vw, 2.5rem)' }}
        >
          Bienvenido a la fuente más accesible y gratuita para análisis fundamentales de acciones colombianas e internacionales. Aquí encontrarás métricas clave como ingresos, utilidad neta, FCF y más.
        </p>

        <div className="space-y-4">
          <a
            href="/dashboard/BCOLOMBIA"
            className="inline-block w-full px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
          >
            Ver Dashboard Bancolombia
          </a>
          <a
            href="/dashboard/PFDAVVNDA"
            className="inline-block w-full px-6 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 transition"
          >
            Ver Dashboard Davivienda
          </a>
          <a
            href="/dashboard/NU"
            className="inline-block w-full px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition"
          >
            Ver Dashboard Nubank
          </a>
          <a
            href="/dashboard/ECOPETROL"
            className="inline-block w-full px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition"
          >
            Ver Dashboard Ecopetrol
          </a>

          <div className="mt-[30px] flex justify-center">
            <div className="relative w-full max-w-[1280px]">
              {/* Main image */}
              <img
                src="/me.png"
                alt="Alejandro señalando el canal de YouTube"
                className="w-full h-auto"
              />

              {/* YouTube Logo */}
              <a
                href="https://www.youtube.com/@ahainvesting"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute animate-bounce transition-transform hover:scale-110"
                style={{
                  top: '-5%',       // Adjust relative to the image's height
                  left: '65%',      // Adjust relative to the image's width
                  width: '30%',     // Responsive width relative to image
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
      </div>
    </main>
  );
}
