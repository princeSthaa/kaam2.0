import type { Metadata } from "next";
import "./globals.css";
import { GlobalHeadLinks } from "./components/GlobalHeadLinks";

export const metadata: Metadata = {
  title: "kaam",
  description: "Kaam operations frontend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <GlobalHeadLinks />
      </head>
      <body className="app-body">{children}</body>
    </html>
  );
}
