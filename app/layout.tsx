import "./globals.css";
import { Navbar } from "@/components/navbar";
import { RealtimeNotificationListener } from "@/components/realtime-notification-listener";

export const metadata = {
  title: "UniTrace — Precision Campus Lost & Found Intelligence",
  description: "Enterprise multimodal lost and found platform matching objects by appearance, context, location, and time.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-[#F7F7F5] text-[#171717] antialiased selection:bg-[#3867E8] selection:text-white font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <RealtimeNotificationListener />
        <footer className="border-t border-[#DADAD6] bg-white py-10">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 px-4 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-tight text-[#171717]">UNITRACE</span>
                <span className="text-[#DADAD6]">/</span>
                <span className="font-mono text-[11px] text-[#777777]">PRECISION INTELLIGENCE PLATFORM</span>
              </div>
              <p className="text-xs text-[#777777]">
                Institutional deployment: Newton University • Automated custody verification
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] text-[#777777]">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25845A]" />
                AUDIT ENGINE: ONLINE
              </span>
              <span>ZERO-KNOWLEDGE PROTOCOL</span>
              <span>FINGERPRINT V3.4</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
