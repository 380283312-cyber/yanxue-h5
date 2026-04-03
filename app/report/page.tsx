"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<{ name: string; content: string } | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("yanxue_report");
      if (stored) {
        setReport(JSON.parse(stored));
      } else {
        setReport({ name: "报告", content: "未找到报告数据，请返回重新生成。" });
      }
    } catch {
      setReport({ name: "报告", content: "报告加载失败" });
    }
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("链接已复制，粘贴给朋友即可查看！");
    } catch {
      alert("复制失败，请手动复制地址栏链接");
    }
  };

  if (!report) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#666" }}>加载中…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#f5f5f5", display: "flex", flexDirection: "column" }}>
      {/* 顶部导航 */}
      <div style={{
        background: "linear-gradient(135deg, #01c3a3 0%, #00a88a 100%)",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}
        >
          ← 返回
        </button>
        <span style={{ fontSize: "16px", fontWeight: "600" }}>研学报告</span>
        <button
          onClick={handleCopy}
          style={{ background: "none", border: "none", color: "white", fontSize: "14px", cursor: "pointer" }}
        >
          分享
        </button>
      </div>

      {/* 报告内容 - 可滚动 */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "80px" }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "16px",
        }}>
          <h1 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#0a2463",
            marginBottom: "12px",
            borderBottom: "2px solid #01c3a3",
            paddingBottom: "8px",
          }}>
            📄 {report.name}
          </h1>
          <div style={{ fontSize: "14px", lineHeight: "1.8", color: "#333", whiteSpace: "pre-wrap" }}>
            {report.content}
          </div>
        </div>
      </div>

      {/* 底部固定操作栏 */}
      <div style={{
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        background: "white",
        padding: "12px 16px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
      }}>
        <button
          onClick={handleCopy}
          style={{
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #01c3a3 0%, #00a88a 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📋 复制分享链接
        </button>
      </div>
    </div>
  );
}
