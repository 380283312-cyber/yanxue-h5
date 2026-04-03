import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "研学报告",
  description: "查看你的研学报告",
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}