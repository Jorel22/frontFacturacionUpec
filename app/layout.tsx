import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FacturaEC · Sistema de Facturación Electrónica (SRI Ecuador)",
  description: "Emisión, control y gestión de comprobantes electrónicos offline",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
