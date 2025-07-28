"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from '@/i18n/navigation';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useTranslation";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useAuth();
  // const common = useCommon(); // Unused for now

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      // Utiliser signInWithOtp pour l'inscription avec OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true, // Créer un utilisateur si il n'existe pas
          emailRedirectTo: undefined // Pas de redirection automatique par email
        }
      });
      
      if (error) throw error;
      
      // Stocker l'email pour le flux OTP et marquer comme inscription
      localStorage.setItem('signup-email', email);
      localStorage.setItem('signup-flow', 'true');
      
      // Redirection vers la page OTP avec paramètres d'inscription
      router.push(`/auth/signup-otp?email=${encodeURIComponent(email)}&type=signup`);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('signUp.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('signUp.title')}</CardTitle>
          <CardDescription>{t('signUp.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('signUp.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  {t('signUp.otpDescription')}
                </p>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('signUp.signingUp') : t('signUp.signUpButton')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('signUp.haveAccount')}{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                {t('signUp.login')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
