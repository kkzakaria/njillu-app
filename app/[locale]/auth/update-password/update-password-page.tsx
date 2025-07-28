import { UpdatePasswordForm } from "./components/update-password-form";
import { AuthLayout } from "../components/auth-layout";
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { redirect } from "next/navigation";

export default async function UpdatePasswordPage() {
  // Pour update-password, nous utilisons checkAuthenticationStatus
  // mais laissons passer les utilisateurs en état de récupération
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