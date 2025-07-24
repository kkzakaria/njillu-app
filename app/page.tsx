import { ThemeSwitcher } from "@/components/theme-switcher";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full flex flex-col items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <span>Mon Application</span>
            </div>
            <ThemeSwitcher />
          </div>
        </nav>
        
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <div className="flex flex-col gap-16 items-center pt-20">
            <h1 className="text-3xl lg:text-4xl font-bold text-center">
              Bienvenue dans votre application
            </h1>
            <p className="text-lg text-center text-muted-foreground max-w-2xl">
              Cette application est prête à être développée selon vos besoins.
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