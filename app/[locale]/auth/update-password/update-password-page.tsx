import { UpdatePasswordForm } from "./components/update-password-form";
import { AuthLayout } from "../components/auth-layout";
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { checkUpdatePasswordAccess } from "@/lib/auth/flow-guard";
import { redirect } from "next/navigation";

interface UpdatePasswordPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UpdatePasswordPage({ 
  searchParams 
}: UpdatePasswordPageProps) {
  // Await les paramètres de recherche et les convertir en URLSearchParams
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  // Vérifier d'abord si l'utilisateur a un accès légitime à cette page
  const { isValidAccess, shouldRedirect: shouldRedirectToForgot } = await checkUpdatePasswordAccess(urlSearchParams);
  
  if (!isValidAccess && shouldRedirectToForgot) {
    redirect("/auth/forgot-password");
  }
  
  // Si l'accès est valide, vérifier quand même les sessions complètement authentifiées
  const { shouldRedirect, isAuthenticated } = await checkAuthenticationStatus();
  
  if (shouldRedirect && isAuthenticated) {
    redirect("/protected");
  }
  
  return (
    <AuthLayout>
      <UpdatePasswordForm />
    </AuthLayout>
  );
}