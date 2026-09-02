import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { FlyToCartProvider } from "@/lib/fly-to-cart";
import CustomCursor from "@/components/CustomCursor";
import FloatingActions from "@/components/FloatingActions";
import CookieConsent from "@/components/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL("https://amytronicsperu.com"),
  title: "AMYTRONICS | Sensores, actuadores y controladores",
  description:
    "Tienda de componentes electrónicos y robótica en Perú: sensores, actuadores, controladores y más.",
  applicationName: "AMYTRONICS",
  openGraph: {
    title: "AMYTRONICS",
    description:
      "Tienda de componentes electrónicos y robótica en Perú: sensores, actuadores, controladores y más.",
    url: "/",
    siteName: "AMYTRONICS",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AMYTRONICS",
    description:
      "Tienda de componentes electrónicos y robótica en Perú: sensores, actuadores, controladores y más.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        <CustomCursor />
        <CartProvider>
          <FlyToCartProvider>
            <div className="app-zoom flex flex-1 flex-col">{children}</div>
          </FlyToCartProvider>
        </CartProvider>
        <FloatingActions />
        <CookieConsent />
      </body>
    </html>
  );
}
