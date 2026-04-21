import type { Metadata } from "next";
import { Sora } from "next/font/google";
import Navbar from "@/components/layout/Navbar";
import "../styles/globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Pedidos App",
  description: "Aplicación de pedidos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080808] text-neutral-50">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
