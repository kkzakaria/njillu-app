"use client";

import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { CurrentUserAvatar } from '@/components/current-user-avatar';

export function AppBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo/Brand section */}
        <div className="flex items-center space-x-2">
          {/* Add your logo or brand name here */}
          <h1 className="text-lg font-semibold">Njillu App</h1>
        </div>

        {/* Right section with controls */}
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <CurrentUserAvatar />
        </div>
      </div>
    </header>
  );
}