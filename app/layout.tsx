import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Objective News - Fact-Based News Aggregator",
  description: "Get only the facts. No opinions, no bias, just verified information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
