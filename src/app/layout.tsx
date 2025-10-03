import "./globals.css";
import type { Metadata } from "next";
import { ReactQueryProvider } from "@/components/providers/query-client-provider";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "自選股即時儀表板",
  description: "每分鐘更新的自選股追蹤與告警儀表板",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-Hant" className="dark">
      <body className="bg-background text-slate-100">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
