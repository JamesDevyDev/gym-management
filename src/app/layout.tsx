import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boilerplate Fullstack nextjs with roles",
  description: "Boilerplate made by James.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
      >
        {children}
      </body>
    </html>
  );
}
