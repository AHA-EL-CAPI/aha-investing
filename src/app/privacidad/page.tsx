import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de privacidad | AHA Investing',
  description: 'Política de privacidad de la herramienta de comentarios de AHA Investing.',
};

export default function Privacidad() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Política de privacidad</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>AHA Investing · «AHA Comentarios YouTube» · Actualizada el 15 de noviembre de 2026</p>
      <h2 style={{ fontWeight: 600, marginTop: 20 }}>Qué es</h2>
      <p>«AHA Comentarios YouTube» es una herramienta de uso personal del titular del canal AHA Investing. No es un servicio abierto al público ni tiene otros usuarios.</p>
      <h2 style={{ fontWeight: 600, marginTop: 20 }}>Qué hace</h2>
      <p>Usa la API de YouTube solo para leer y responder los comentarios de los propios canales del titular, y para moderarlos (por ejemplo, ocultar spam). No accede a canales ajenos.</p>
      <h2 style={{ fontWeight: 600, marginTop: 20 }}>Qué datos guarda</h2>
      <p>Las credenciales de acceso quedan únicamente en el computador del titular. Los comentarios que se leen se procesan en ese mismo computador; no se almacenan datos de terceros en servidores externos, no se venden, no se comparten y no se usan para publicidad.</p>
      <h2 style={{ fontWeight: 600, marginTop: 20 }}>Servicios de Google</h2>
      <p>El uso de la información recibida de las API de Google se ajusta a la <a href="https://developers.google.com/terms/api-services-user-data-policy">Política de datos de usuario de los servicios de API de Google</a>, incluidos los requisitos de uso limitado. El titular puede revocar el acceso en cualquier momento desde la configuración de su cuenta de Google.</p>
      <h2 style={{ fontWeight: 600, marginTop: 20 }}>Contacto</h2>
      <p>WhatsApp de negocio: +57 315 494 5352.</p>
      <p style={{ marginTop: 32 }}><Link href="/">Volver al inicio</Link></p>
    </main>
  );
}
