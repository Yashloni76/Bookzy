import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookZy",
  description: "Appointment booking for Indian small businesses",
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
