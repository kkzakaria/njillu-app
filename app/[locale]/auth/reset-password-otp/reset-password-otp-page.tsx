import { ResetPasswordOtpForm } from "./components/reset-password-otp-form";
import { AuthLayout } from "../components/auth-layout";
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { checkOtpResetAccess } from "@/lib/auth/flow-guard";
import { redirect } from "next/navigation";

interface ResetPasswordOtpPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ResetPasswordOtpPage({ 
  searchParams 
}: ResetPasswordOtpPageProps) {
  // Await les paramètres de recherche et les convertir en URLSearchParams
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  // Vérification de session - redirige vers /protected si déjà connecté
  const { shouldRedirect } = await checkAuthenticationStatus();
  
  if (shouldRedirect) {
    redirect("/protected");
  }
  
  // Vérification du flux de récupération - empêche l'accès direct
  const { isValidAccess, shouldRedirect: shouldRedirectToForgot } = await checkOtpResetAccess(urlSearchParams);
  
  if (!isValidAccess && shouldRedirectToForgot) {
    redirect("/auth/forgot-password");
  }
  
  return (
    <AuthLayout>
      <ResetPasswordOtpForm />
    </AuthLayout>
  );
}