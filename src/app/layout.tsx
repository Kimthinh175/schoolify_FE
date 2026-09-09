import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Schoolify - Nền Tảng Giáo Dục & Khảo Thí SaaS Toàn Diện",
  description: "Hệ thống quản lý trường học, đào tạo trực tuyến, khảo thí và sổ liên lạc điện tử Schoolify.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo-icon.png', type: 'image/png' },
      { url: '/logo-icon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/logo-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${lexend.variable} font-sans h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
