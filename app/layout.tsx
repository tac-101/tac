import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "../instrumentation-client";
import { ThemeProvider } from "@/components/theme-provider";
import { TapanAssociateProvider } from "@/components/layout/tapan-associate-context";
import { LocationProvider } from "@/lib/location-context";
import { SignoutToastProvider } from "@/lib/signout-toast-context";
import { CommandMenu } from "@/components/command-menu";
import { Toaster } from "@/components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tapango V2 (Lyra)",
  description: "Next-gen dashboard experiment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LocationProvider>
            <SignoutToastProvider>
              <TapanAssociateProvider>
                {children}
                <CommandMenu />
                <Toaster />
              </TapanAssociateProvider>
            </SignoutToastProvider>
          </LocationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
