import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loogans Bluff Online",
  description: "Explore Loogans Bluff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
