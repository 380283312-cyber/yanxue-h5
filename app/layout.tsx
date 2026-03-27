import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://yanxue-ai.vercel.app"),
  title: "研学AI助手 - 智能规划研学之旅",
  description: "输入目的地和天数，AI帮你生成完整研学方案",
  keywords: "研学,AI,智能规划,行程规划,研学课程",
  openGraph: {
    title: "研学AI助手 - 智能规划研学之旅",
    description: "输入目的地和天数，AI帮你生成完整研学方案",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "研学AI助手",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "研学AI助手 - 智能规划研学之旅",
    description: "输入目的地和天数，AI帮你生成完整研学方案",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#01C3A3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/icon.png" type="image/png" />
        <script
          src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"
          async
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
