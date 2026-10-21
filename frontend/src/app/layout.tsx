import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "snoopfish - background checks....kinda",
  description: "Tiny fish that snoops the whole web to catch fake vendors, recruiters, and ghost colleges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-neo-cream text-neo-black min-h-screen">
        {children}
      </body>
    </html>
  );
}
