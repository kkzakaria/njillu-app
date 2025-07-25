import Link from 'next/link';

// This page renders when a route is not found globally
export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-lg mb-4">Page non trouvée</p>
            <Link 
              href="/fr" 
              className="text-blue-500 hover:text-blue-700 underline"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}