import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthLayout } from "../components/auth-layout";
import { getTranslations } from 'next-intl/server';
import { checkAuthenticationStatus } from "@/lib/auth/session-guard";
import { checkSignUpSuccessAccess } from "@/lib/auth/flow-guard";
import { redirect } from "next/navigation";

interface SignUpSuccessPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignUpSuccessPage({ 
  searchParams 
}: SignUpSuccessPageProps) {
  // Await les paramètres de recherche et les convertir en URLSearchParams
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    }
  });
  
  // Vérification de l'accès légitime à cette page
  const { isValidAccess, shouldRedirect: shouldRedirectToSignUp } = await checkSignUpSuccessAccess(urlSearchParams);
  
  if (!isValidAccess && shouldRedirectToSignUp) {
    redirect("/auth/sign-up");
  }
  
  // Vérification de session - redirige vers /protected si déjà connecté
  const { shouldRedirect } = await checkAuthenticationStatus();
  
  if (shouldRedirect) {
    redirect("/protected");
  }
  
  const t = await getTranslations('auth.signUpSuccess');
  
  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {t('title')}
            </CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('message')}
            </p>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}