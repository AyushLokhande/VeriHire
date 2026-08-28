import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeriHire | Multi-Agent Interview Intelligence",
  description: "Evidence-backed hiring decisions powered by a multi-agent AI interview panel.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
