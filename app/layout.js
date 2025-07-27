import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({
  subsets: ["latin"]
});

export const metadata = {
  title: "Savi",
  description: "one stop financial solution for all your needs",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${inter.className}`}
      >
        {/* {header} */}
        <Header />
        {/* Main content area */}
        <main className="min-h-screen bg-white">
        {children}
        </main>
        {/* {footer} */}
        <footer className="bg- text-slate-800 p-4 text-center">
          <div className="container mx-auto">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Savi. All rights reserved.
            </p>
            <p className="text-sm">
              Made with ❤️ by Hitika
            </p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
