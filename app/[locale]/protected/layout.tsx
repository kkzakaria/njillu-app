import { MainLayout } from "@/components/main-layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout 
      debugMode={false}
      appTitle="Mon Application"
    >
      {children}
    </MainLayout>
  );
}