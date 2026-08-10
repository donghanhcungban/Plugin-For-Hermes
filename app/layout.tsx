import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CYRA 3D - Cybernetic AI Assistant (STT & TTS)',
  description: 'Trợ lý AI 3D phiên bản Robot Cyber Android với khả năng giao tiếp bằng giọng nói STT, TTS và trí tuệ Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" data-theme="dark" className="dark">
      <body className="bg-[#0b1220] text-[#e8eef8] antialiased selection:bg-cyber-cyan selection:text-black min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
