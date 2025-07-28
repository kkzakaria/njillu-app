import { ForgotPasswordForm } from "./components/forgot-password-form";
import { AuthLayout } from "../components/auth-layout";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}