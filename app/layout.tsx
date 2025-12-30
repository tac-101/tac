import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SentryInitializer } from "@/components/sentry-initializer";
import { ThemeProvider } from "@/components/theme-provider";
import { ActiveThemeProvider } from "@/components/active-theme";
import { TapanAssociateProvider } from "@/components/layout/tapan-associate-context";
import { cookies } from "next/headers";
import { LocationProvider } from "@/lib/location-context";
import { SignoutToastProvider } from "@/lib/signout-toast-context";
import { CommandMenu } from "@/components/command-menu";
import { Toaster } from "@/components/ui/sonner";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tapan Associate Cargo",
  description: "Next-gen dashboard experiment",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const activeTheme = cookieStore.get("active_theme")?.value || "default";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${jetbrainsMono.variable} font-sans antialiased ${activeTheme ? `theme-${activeTheme}` : ""
          }`}
      >
        <SentryInitializer />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ActiveThemeProvider initialTheme={activeTheme}>
            <LocationProvider>
              <SignoutToastProvider>
                <TapanAssociateProvider>
                  {children}
                  <CommandMenu />
                  <Toaster />
                </TapanAssociateProvider>
              </SignoutToastProvider>
            </LocationProvider>
          </ActiveThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
