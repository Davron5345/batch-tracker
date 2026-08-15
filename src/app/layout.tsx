import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { RegisterSW } from "@/components/RegisterSW";
import { getServerLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Партии — учёт товаров",
  description: "Система учёта партий товаров с QR и медиа",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Партии",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0f6e56",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale}>
      <body className="antialiased">
        <Providers locale={locale}>
          <RegisterSW />
          {children}
        </Providers>
      </body>
    </html>
  );
}
