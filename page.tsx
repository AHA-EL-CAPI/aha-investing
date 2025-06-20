export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          AHA Investing
        </h1>
        <p className="text-lg text-gray-600 mb-6">
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
        </div>
      </div>
    </main>
  );
}
