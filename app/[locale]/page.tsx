import { getTranslations } from 'next-intl/server';
import { Button } from "@/components/ui/button";
import { Globe } from "@/components/magicui/globe";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";

export default async function Home() {
  const t = await getTranslations();

  return (
    <main className="min-h-screen flex flex-col">
      {/* Section Titre et Bouton */}
      <section className="flex-grow flex flex-col items-center justify-center pt-12">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text text-transparent">
            NjilluApp
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-md mx-auto">
            {t('home.subtitle')}
          </p>
          
          <Button size="lg" className="text-lg px-8" asChild>
            <Link href="/auth/login">
              {t('common.login')}
            </Link>
          </Button>
        </div>
      </section>
      
      {/* Section Globe */}
      <section className="flex-grow relative overflow-hidden">
        <Globe className="opacity-70 !relative !inset-auto !w-full !h-full" />
      </section>

      {/* Footer with Centered Controls */}
      <footer className="w-full h-16 flex items-center justify-center border-t px-8">
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </footer>
    </main>
  );
}