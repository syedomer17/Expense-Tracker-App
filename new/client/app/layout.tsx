import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Instrument_Serif, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ledger — Premium Expense Tracker",
  description:
    "Beautifully simple personal finance tracking. Capture income, watch expenses, and grow your savings rate.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakarta.variable} ${instrumentSerif.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
