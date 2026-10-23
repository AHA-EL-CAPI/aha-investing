import Link from 'next/link';

// Nota bajo el titulo de los dashboards que se alimentan del pipeline bvc-fundamentales
export function OfficialDataNote({ id, lastQuarter, children }: { id: string; lastQuarter: string; children?: React.ReactNode }) {
  return (
    <div className="flex max-w-3xl flex-col gap-2 text-sm leading-relaxed text-muted">
      <p>
        Datos oficiales de SIMEV (Superintendencia Financiera), actualizados automáticamente. Último trimestre:{' '}
        <span className="font-mono text-fg">{lastQuarter}</span>. Cifras en billones de COP.{' '}
        <Link href={`/bvc/${id}`} className="font-semibold text-accent hover:underline">
          Ver ficha completa y múltiplos →
        </Link>
      </p>
      {children ? <p>{children}</p> : null}
    </div>
  );
}
