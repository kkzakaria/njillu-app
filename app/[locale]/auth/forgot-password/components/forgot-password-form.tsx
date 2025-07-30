"use client";

import { cn } from "@/lib/utils";
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
import { useState } from "react";
import { useAuth } from "@/hooks/useTranslation";
import { Link } from "@/i18n/navigation";
import { useLocale } from 'next-intl';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const t = useAuth();
  const locale = useLocale();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ CORRECTION: URL et headers corrects
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing');
      }
      
      const functionUrl = `${supabaseUrl}/functions/v1/request-password-reset`;
      
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`, // ✅ AJOUT OBLIGATOIRE
          'apikey': supabaseAnonKey // ✅ AJOUT OBLIGATOIRE
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to send reset email';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
        }
        setError(errorMessage);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        // Utiliser l'URL fournie par l'Edge Function (contient déjà temp_token)
        if (result.redirectUrl) {
          // L'Edge Function retourne une URL avec temp_token, la localiser
          const url = new URL(result.redirectUrl, window.location.origin);
          const email = url.searchParams.get('email');
          const tempToken = url.searchParams.get('temp_token');
          
          const localizedPaths = {
            fr: '/fr/auth/verification-code',
            en: '/en/auth/reset-password-otp', 
            es: '/es/auth/codigo-verificacion'
          };
          
          const localizedUrl = `${localizedPaths[locale as keyof typeof localizedPaths]}?email=${encodeURIComponent(email || '')}&temp_token=${tempToken || ''}`;
          
          // Redirection immédiate avec temp_token pour accès rapide
          window.location.href = localizedUrl;
        } else {
          // Fallback sans temp_token
          const localizedPaths = {
            fr: '/fr/auth/verification-code',
            en: '/en/auth/reset-password-otp', 
            es: '/es/auth/codigo-verificacion'
          };
          
          const localizedUrl = `${localizedPaths[locale as keyof typeof localizedPaths]}?email=${encodeURIComponent(email)}`;
          window.location.href = localizedUrl;
        }
        
        return; // Sortir de la fonction pour éviter setIsLoading(false)
      } else {
        setError('Unexpected response from server');
      }
      
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      // Ne pas mettre isLoading à false si on redirige (on ne devrait pas arriver ici en cas de succès)
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('forgotPassword.title')}</CardTitle>
          <CardDescription>
            {t('forgotPassword.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{t('forgotPassword.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('forgotPassword.sending') : t('forgotPassword.sendButton')}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t('forgotPassword.backToLogin')}{" "}
              <Link
                href="/auth/login"
                className="underline underline-offset-4"
              >
                {t('login.loginButton')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}