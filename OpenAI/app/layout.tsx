import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conexión Terminal LLM",
  description: "Interfaz web premium conectada a modelos de lenguaje avanzados.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning={true}>
        <div className="ambient-glow" />
        {children}
      </body>
    </html>
  );
}
