import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'To-Do Lab — Remediación',
  description: 'Laboratorio educativo de remediación DevSecOps (DSS / UCN)',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <div className="banner">
          Entorno educativo de remediación DevSecOps
        </div>
        {children}
      </body>
    </html>
  );
}
