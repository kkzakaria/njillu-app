import { SignUpOtpForm } from "./components/signup-otp-form";
import { AuthLayout } from "../components/auth-layout";
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { checkSignUpOtpAccess } from "@/lib/auth/flow-guard";
import { redirect } from "next/navigation";

interface SignUpOtpPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignUpOtpPage({ 
  searchParams 
}: SignUpOtpPageProps) {
  // Await les paramètres de recherche et les convertir en URLSearchParams
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  // Vérification de l'accès légitime à cette page
  const { isValidAccess, shouldRedirect: shouldRedirectToSignUp } = await checkSignUpOtpAccess(urlSearchParams);
  
  if (!isValidAccess && shouldRedirectToSignUp) {
    redirect("/auth/sign-up");
  }
  
  // Vérification de session - redirige vers /protected si déjà connecté
  const { shouldRedirect } = await checkAuthenticationStatus();
  
  if (shouldRedirect) {
    redirect("/protected");
  }
  
  return (
    <AuthLayout>
      <SignUpOtpForm />
    </AuthLayout>
  );
}