import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: "Asistente KOA | Mentor-IA",
  description: "Demo de asistente conversacional. Caso de uso: Soporte Interno",
  keywords: ["IA", "Chatbot", "Agente IA", "Mentor-IA", "Asistente IA"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
