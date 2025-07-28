import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 relative">
      {/* Sélecteurs en haut à droite avec design amélioré */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border bg-card p-1 shadow-sm">
          <ThemeSwitcher />
          <div className="w-px h-6 bg-border" />
          <LanguageSwitcher />
        </div>
      </div>
      
      {/* Contenu de la page centré */}
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}