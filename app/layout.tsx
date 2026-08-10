import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ambient AI Assistant — Trợ lý AI Cuộc họp & Ghi chú Trí nhớ",
  description: "Trợ lý AI Cuộc họp & Ghi chú Trí nhớ Thông minh. Thu âm, trích xuất việc cần làm, lịch hẹn và hỏi đáp ký ức.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ambient AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#060c18",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-theme="dark" className="dark">
      <body className="bg-[#060c18] text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950 min-h-screen">
        {children}
      </body>
    </html>
  );
}
