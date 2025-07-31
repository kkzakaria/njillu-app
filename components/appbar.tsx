"use client";

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { CurrentUserAvatar } from '@/components/current-user-avatar';
import { Separator } from '@/components/ui/separator';

export function AppBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 w-full max-w-none">
        {/* Logo/Brand section - complètement masqué sur mobile */}
        <div className="flex items-center">
          {/* Logo et nom - visibles seulement sur desktop (1024px+) */}
          <div className="hidden lg:flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              {/* Logo placeholder */}
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <h1 className="text-base lg:text-lg font-semibold text-foreground">
                Njillu App
              </h1>
            </div>
          </div>
        </div>

        {/* Center section - vous pouvez ajouter des éléments ici si nécessaire */}
        <div className="hidden md:flex flex-1 justify-center">
          {/* Espace pour navigation centrale si nécessaire */}
        </div>

        {/* Right section with controls */}
        <div className="flex items-center space-x-1">
          <div className="flex items-center space-x-1">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          
          {/* Séparateur visuel - masqué sur mobile */}
          <Separator orientation="vertical" className="hidden sm:block h-6 mx-2" />
          
          {/* Avatar utilisateur */}
          <div className="flex items-center ml-1 sm:ml-0">
            <CurrentUserAvatar />
          </div>
        </div>
      </div>
    </header>
  );
}