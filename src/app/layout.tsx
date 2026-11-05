import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Amaze ERP",
    template: "%s | Amaze ERP",
  },
  description: "Enterprise Resource Planning System",
  icons: {
    icon: "/header-logo.png?v=3",
    shortcut: "/header-logo.png?v=3",
    apple: "/header-logo.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/header-logo.png?v=3" type="image/png" sizes="any" />
        <link rel="shortcut icon" href="/header-logo.png?v=3" type="image/png" />
        <link rel="apple-touch-icon" href="/header-logo.png?v=3" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
