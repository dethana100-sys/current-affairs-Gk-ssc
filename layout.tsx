import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "India Current Affairs Quiz | Jan 2025 – Jul 2026",
  description:
    "Test your knowledge of India's current affairs from January 2025 to July 2026. Monthly quiz with 30+ questions per month, 5 random questions per round.",
  keywords: "India current affairs, quiz, monthly, 2025, 2026, UPSC, GK",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
