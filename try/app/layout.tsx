import type { Metadata } from "next";
import "./styles/globals.css";
import { GlobalHeadLinks } from "./components/layout/GlobalHeadLinks";
import { AppHeader } from "./components/layout/AppHeader";

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
    <html lang="en" className="light" data-scroll-behavior="smooth">
      <head>
        <GlobalHeadLinks />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="app-body">
        <div className="app-shell">
          <AppHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
