import localFont from "next/font/local";
import "./globals.css";

import { AuthProvider } from "@/src/context/AuthContext";
import { NotificationProvider } from "@/src/context/NotificationContext";
import { StatsProvider } from "@/src/context/StatsContext";
import { AppsProvider } from "@/src/context/AppsContext";

const vazir = localFont({
  src: [
    {
      path: "../../public/fonts/vazir-font-v18.0.0/Vazir-Thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir-font-v18.0.0/Vazir-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir-font-v18.0.0/Vazir.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir-font-v18.0.0/Vazir-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/vazir-font-v18.0.0/Vazir-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-vazir",
  display: "swap",
});

const yekan = localFont({
  src: [
    {
      path: "../../public/fonts/yekan/Yekan.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-yekan",
  display: "swap",
});

export const metadata = {
  title: "پیشخوان سازمانی شرکت باما | پورتال یکپارچه",
  description:
    "سامانه دسترسی سریع به سامانه‌ها و سرویس‌های داخلی شرکت باما",
  applicationName: "Bama Enterprise Portal",
  authors: [
    {
      name: "جابر بکرانی",
      url: "https://bama.ir",
    },
  ],
  creator: "جابر بکرانی",
  publisher: "Jaber Bakrani",
  other: {
    "developer-credit": "Developed by Jaber Bakrani",
    "portal-version": "2.4.0-release",
    "author-signature": "bama-core-jb-2024",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fa"
      dir="rtl"
      suppressHydrationWarning
      className={`${vazir.variable} ${yekan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 font-sans text-slate-800 selection:bg-cyan-500 selection:text-white transition-colors duration-200 dark:bg-[#070c18] dark:text-slate-100">
        <AuthProvider>
          <NotificationProvider>
            <StatsProvider>
              <AppsProvider>{children}</AppsProvider>
            </StatsProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
