import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Navbar, Footer } from "../components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Signal Engines Hub",
  description: "Directory of specialist traffic engines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`} suppressHydrationWarning>
        <AuthProvider>
          <Navbar />
          <div className="flex-grow">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
