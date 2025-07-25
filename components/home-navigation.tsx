"use client";

import { useTranslations } from 'next-intl';
import { ThemeSwitcher } from "@/components/theme-switcher";
import { LanguageSwitcher } from "@/components/language-switcher";

export function HomeNavigation() {
  const t = useTranslations();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <span>{t('metadata.title')}</span>
        </div>
        <div className="flex gap-2 items-center">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}