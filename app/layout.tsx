import "./globals.css";
import { Navbar } from "@/components/navbar";
import { RealtimeNotificationListener } from "@/components/realtime-notification-listener";

export const metadata = {
  title: "UniTrace — AI-Powered Campus Lost & Found Intelligence",
  description: "Enterprise multimodal lost and found platform matching objects by appearance, context, location, and time.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased selection:bg-brand-500 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <RealtimeNotificationListener />
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex items-center gap-2"> 
              <span className="font-bold tracking-tight text-slate-900">UniTrace</span>
              <span className="text-xs text-slate-500">
                — AI-Powered Campus Lost & Found Intelligence Platform
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <span>Apex University Pilot Deployment</span>
              <span>•</span>
              <span>Zero-Knowledge Verification</span>
              <span>•</span>
              <span>Audit Logging Active</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
