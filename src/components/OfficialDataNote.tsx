import Link from 'next/link';

// Nota bajo el titulo de los dashboards que se alimentan del pipeline bvc-fundamentales
export function OfficialDataNote({ id, lastQuarter, children }: { id: string; lastQuarter: string; children?: React.ReactNode }) {
  return (
    <div style={{ maxWidth: '48rem', margin: '-0.5rem auto 1.5rem', textAlign: 'center', fontSize: '0.95rem', color: '#9ca3af', lineHeight: 1.5 }}>
      <p style={{ margin: 0 }}>
        Datos oficiales de SIMEV (Superintendencia Financiera), actualizados automáticamente. Último trimestre:{' '}
        {lastQuarter}. Cifras en billones de COP.{' '}
        <Link href={`/bvc/${id}`} style={{ color: '#22c55e', fontWeight: 600 }}>
          Ver ficha completa y múltiplos →
        </Link>
      </p>
      {children ? <p style={{ margin: '0.5rem 0 0' }}>{children}</p> : null}
    </div>
  );
}
