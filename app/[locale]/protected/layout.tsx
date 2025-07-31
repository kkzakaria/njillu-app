import { AppLayout } from "@/components/app-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppLayout 
      debugMode={true}
      showHeader={true}
      showFooter={true}
      appTitle="Mon Application"
    >
      {children}
    </AppLayout>
  );
}