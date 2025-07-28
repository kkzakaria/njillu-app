import { UpdatePasswordForm } from "./components/update-password-form";
import { AuthLayout } from "../components/auth-layout";

export default function UpdatePasswordPage() {
  return (
    <AuthLayout>
      <UpdatePasswordForm />
    </AuthLayout>
  );
}