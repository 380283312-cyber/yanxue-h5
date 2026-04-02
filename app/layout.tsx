import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.woaiyanxue.cn"),
  title: {
    default: "研学AI助手 - 智能规划研学之旅",
    template: "%s | 研学AI助手",
  },
  description: "AI智能研学顾问，为学生和家长提供专业的研学课程推荐、行程规划、报告生成服务",
  keywords: "研学,AI,智能规划,行程规划,研学课程,研学报告,西安研学,北京研学,研学基地,亲子研学",
  authors: [{ name: "研学AI助手" }],
  creator: "研学AI助手",
  publisher: "研学AI助手",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "研学AI助手 - 智能规划研学之旅",
    description: "AI智能研学顾问，为学生和家长提供专业的研学课程推荐、行程规划、报告生成服务",
    type: "website",
    locale: "zh_CN",
    siteName: "研学AI助手",
    url: "https://www.woaiyanxue.cn",
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
    description: "AI智能研学顾问，为学生和家长提供专业的研学课程推荐、行程规划、报告生成服务",
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
