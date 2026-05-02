import type { Metadata } from "next";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Makeup Advisor",
  description: "AI-powered makeup and skincare product recommendations",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
