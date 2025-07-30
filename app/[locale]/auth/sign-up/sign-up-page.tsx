import { SignUpForm } from "./components/sign-up-form";
import { AuthLayout } from "../components/auth-layout";
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { redirect } from "next/navigation";

export default async function SignUpPage() {
  // Vérification de session - redirige vers /protected si déjà connecté
  const { shouldRedirect } = await checkAuthenticationStatus();
  
  if (shouldRedirect) {
    redirect("/protected");
  }
  
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}