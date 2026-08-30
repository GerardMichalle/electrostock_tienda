import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";

// NOTA: en este entorno de sandbox no hay salida a fonts.googleapis.com,
// por eso usamos una pila de fuentes de sistema como fallback temporal.
// Al desplegar en Vercel (con internet real), reemplaza este bloque por:
//
// import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
// const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"], weight: ["600","700","800"] });
// const plexSans = IBM_Plex_Sans({ variable: "--font-plex-sans", subsets: ["latin"], weight: ["400","500","600"] });
// const plexMono = IBM_Plex_Mono({ variable: "--font-plex-mono", subsets: ["latin"], weight: ["400","500"] });
// y añade `${archivo.variable} ${plexSans.variable} ${plexMono.variable}` al className del <html>.

// Ajusta este dominio al de producción cuando se despliegue (usado para
// construir las URL absolutas de las imágenes Open Graph / favicons).
export const metadata: Metadata = {
  metadataBase: new URL("https://electrostock.pe"),
  title: "ElectroStock Perú | Sensores, actuadores y controladores",
  description:
    "Tienda de componentes electrónicos y robótica en Perú: sensores, actuadores, controladores y más.",
  applicationName: "ElectroStock Perú",
  openGraph: {
    title: "ElectroStock Perú",
    description:
      "Tienda de componentes electrónicos y robótica en Perú: sensores, actuadores, controladores y más.",
    url: "/",
    siteName: "ElectroStock Perú",
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ElectroStock Perú",
    description:
      "Tienda de componentes electrónicos y robótica en Perú: sensores, actuadores, controladores y más.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg text-text">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
