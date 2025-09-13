import { cookies } from "next/headers";
import "./globals.css";
import "./theme.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/provider";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
};

export const metadata = {
  title: "Mohol Abdur Rahim",
  description: "A Smart Tailoring and Fabric Shop In Oman",
  keywords: ["tailoring", "management", "bangladesh", "shop"],
  authors: [{ name: "Usama Forayaje" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
};

export const viewport = {
  themeColor: META_THEME_COLORS.light,
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get("active_theme")?.value;
  const isScaled = activeThemeValue?.endsWith("-scaled");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]').setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "bg-background overflow-hidden overscroll-none font-sans antialiased",
          activeThemeValue ? `theme-${activeThemeValue}` : "",
          isScaled ? "theme-scaled" : "",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
