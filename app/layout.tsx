import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SolarExpert — AI-assisted solar diagnostics",
  description: "Expert system for residential solar/inverter troubleshooting and system design.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background min-h-screen">{children}</body>
    </html>
  );
}
