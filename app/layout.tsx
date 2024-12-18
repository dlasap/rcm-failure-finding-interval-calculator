import "@/app/globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import { SettingsProvider } from "@/lib/settings-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Failure Finding Interval Calculator v1.0",
  description:
    "A web-based application for reliability engineers to calculate Failure Finding Intervals (FFI), probabilities of failure, and related metrics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SettingsProvider>
          <div className="flex flex-col min-h-screen bg-background text-foreground">
            <Header />
            <main className="flex-grow container mx-auto py-8 px-4">
              <ErrorBoundary>{children}</ErrorBoundary>
            </main>
            <Footer />
          </div>
          <Toaster />
        </SettingsProvider>
      </body>
    </html>
  );
}
