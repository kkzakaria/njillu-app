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
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Link } from '@/i18n/navigation';
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useTranslations } from 'next-intl';

export function ResetPasswordOtpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('auth.resetPasswordOtp');

  // Function to start cooldown
  const startCooldown = useCallback(() => {
    setCooldownSeconds(60); // 1 minute cooldown
  }, []);

  useEffect(() => {
    // Get email from URL parameters or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('reset-email');
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('reset-email', emailParam);
      // Start cooldown immediately since we just sent an OTP to get here
      startCooldown();
    } else if (storedEmail) {
      setEmail(storedEmail);
      // Start cooldown immediately since we just sent an OTP to get here
      startCooldown();
    } else {
      // Redirect to forgot password if no email is found
      router.push('/auth/forgot-password');
    }
  }, [searchParams, router, startCooldown]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownSeconds > 0) {
      const timer = setTimeout(() => {
        setCooldownSeconds(cooldownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownSeconds]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      setError(t('invalidOtpLength'));
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });

      if (error) throw error;

      // Clear stored email and redirect to update password
      localStorage.removeItem('reset-email');
      router.push('/auth/update-password');
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldownSeconds > 0) return; // Prevent resend during cooldown
    
    const supabase = createClient();
    setIsResending(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: undefined
        }
      });
      if (error) throw error;
      
      // Clear current OTP and show success message
      setOtp("");
      setSuccessMessage(t('resendSuccess'));
      
      // Start cooldown timer
      startCooldown();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : t('resendError'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {t('description')} {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerifyOtp}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="otp" className="text-center">
                  {t('otpLabel')}
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {t('otpHelp')}
                </p>
              </div>
              
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              {successMessage && <p className="text-sm text-green-500 text-center">{successMessage}</p>}
              
              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? t('verifying') : t('verifyButton')}
              </Button>
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendOtp}
                  disabled={isResending || cooldownSeconds > 0}
                  className="text-sm"
                >
                  {isResending 
                    ? t('resending') 
                    : cooldownSeconds > 0 
                      ? t('resendCooldown', { seconds: cooldownSeconds })
                      : t('resendButton')
                  }
                </Button>
                {cooldownSeconds > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-1000 ease-linear" 
                        style={{ width: `${((60 - cooldownSeconds) / 60) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center text-sm">
              {t('backToLogin')}{" "}
              <Link
                href="/auth/login"
                className="underline underline-offset-4"
              >
                {t('loginLink')}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}