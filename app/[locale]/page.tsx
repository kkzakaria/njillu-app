import { getTranslations } from 'next-intl/server';
import { HomeNavigation } from "@/components/home-navigation";

export default async function Home() {
  const t = await getTranslations();

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full flex flex-col items-center">
        <HomeNavigation />
        
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <div className="flex flex-col gap-16 items-center pt-20">
            <h1 className="text-3xl lg:text-4xl font-bold text-center">
              {t('home.welcome')}
            </h1>
            <p className="text-lg text-center text-muted-foreground max-w-2xl">
              {t('home.description')}
            </p>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p className="text-muted-foreground">
            Powered by Next.js & Supabase
          </p>
        </footer>
      </div>
    </main>
  );
}