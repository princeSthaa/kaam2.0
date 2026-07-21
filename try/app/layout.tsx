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
    <html lang="en" className="light">
      <head>
        <GlobalHeadLinks />
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
