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
import { redirect } from "next/navigation";

export default async function SignUpSuccessPage() {
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