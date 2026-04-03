"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

function ReportContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [report, setReport] = useState<{ name: string; content: string } | null>(null);

  useEffect(() => {
    const data = params.get("data");
    if (data) {
      try {
        const decoded = JSON.parse(atob(data));
        setReport(decoded);
      } catch {
        setReport({ name: "报告", content: "数据解析失败" });
      }
    }
  }, [params]);

  const handleCopy = async () => {
    const text = `${report?.name || "研学报告"}\n${window.location.href}`;
    await navigator.clipboard.writeText(text).catch(() => {});
    alert("链接已复制，粘贴给朋友即可查看报告！");
  };

  if (!report) {
    return (
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <p style={{ color: "#666" }}>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100dvh", background: "#f5f5f5", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{
        background: "linear-gradient(135deg, #01c3a3 0%, #00a88a 100%)",
        color: "white",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}>
          ← 返回
        </button>
        <span style={{ fontSize: "16px", fontWeight: "600" }}>研学报告</span>
        <button onClick={handleCopy} style={{ background: "none", border: "none", color: "white", fontSize: "14px", cursor: "pointer" }}>
          分享
        </button>
      </div>

      <div style={{ padding: "16px" }}>
        <div style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          marginBottom: "16px",
        }}>
          <h1 style={{ fontSize: "18px", fontWeight: "700", color: "#0a2463", marginBottom: "12px", borderBottom: "2px solid #01c3a3", paddingBottom: "8px" }}>
            📄 {report.name}
          </h1>
          <div style={{ fontSize: "14px", lineHeight: "1.8", color: "#333", whiteSpace: "pre-wrap" }}>
            {report.content}
          </div>
        </div>

        <div style={{
          position: "fixed",
          bottom: "0",
          left: "0",
          right: "0",
          background: "white",
          padding: "12px 16px",
          paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          display: "flex",
          gap: "12px",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        }}>
          <button
            onClick={handleCopy}
            style={{
              flex: 1,
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
    </div>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <p style={{ color: "#666" }}>加载中...</p>
      </div>
    }>
      <ReportContent />
    </Suspense>
  );
}