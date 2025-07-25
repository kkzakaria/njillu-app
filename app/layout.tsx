// Minimal root layout required by Next.js
// Does not provide HTML structure - handled by [locale]/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Just return children without wrapping in html/body
  // The [locale]/layout.tsx handles the HTML structure
  return children;
}