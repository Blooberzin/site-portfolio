import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Renan Content OS",
  description: "Sistema editorial para SEO, GEO, AEO, conteúdo e IA aplicada ao marketing.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
