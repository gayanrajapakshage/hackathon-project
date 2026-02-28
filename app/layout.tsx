import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tuff-O-Meter | How Tuff Are You?",
  description: "Upload your photo. Get judged. Find out your Tuff Level.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
