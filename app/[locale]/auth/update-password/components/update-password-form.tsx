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
import { PasswordInput } from "@/components/password-input";
import { PasswordRequirements } from "@/components/password-requirements";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from 'next-intl';

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('auth.updatePassword');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate password confirmation
    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      // Redirect to protected route after successful password update
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">{t('newPassword')}</Label>
                <PasswordInput
                  id="password"
                  placeholder={t('newPassword')}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordRequirements password={password} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder={t('confirmPassword')}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {password && confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-500">{t('passwordMismatch')}</p>
                )}
              </div>
              
              {error && <p className="text-sm text-red-500">{error}</p>}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !password || !confirmPassword || password !== confirmPassword}
              >
                {isLoading ? t('updating') : t('updateButton')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
