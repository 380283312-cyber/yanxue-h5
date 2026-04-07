"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import PrintableReportCanvas, { generateReportPDF, PrintableReportProps } from "@/components/PrintableReportCanvas";

interface ReportData {
  name: string;
  content: string;
  studentName?: string;
  school?: string;
  grade?: string;
  base?: string;
  theme?: string;
  date?: string;
}

function parseReportContent(content: string): { summary: string; records: string[]; reflection: string } {
  const result = {
    summary: "",
    records: [] as string[],
    reflection: "",
  };

  // 研学概要：支持多种 emoji 格式
  const summaryPatterns = [
    /【📝\s*研学概要\s*】[\s\S]*?(?=【[^】]*?】|$)/,
    /【📋\s*研学概要\s*】[\s\S]*?(?=【[^】]*?】|$)/,
    /【\s*研学概要\s*】[\s\S]*?(?=【[^】]*?】|$)/,
    /研学概要[：:]\s*([\s\S]*?)(?=【|第[一二三四五六七八九十\d]+天|$)/i,
  ];
  for (const p of summaryPatterns) {
    const m = content.match(p);
    if (m && m[0]) {
      result.summary = m[0]
        .replace(/【[^】]*】/g, "")
        .replace(/研学概要[：:]\s*/gi, "")
        .trim()
        .substring(0, 500);
      if (result.summary) break;
    }
  }

  // 研学活动记录：提取每天的行程段落作为记录
  const recordsPatterns = [
    /【📅\s*(?:详细记录|研学活动记录|研学记录)\s*】[\s\S]*?(?=【[^】]*?】|$)/i,
    /【(?:详细记录|研学活动记录|研学记录)\s*】[\s\S]*?(?=【[^】]*?】|$)/i,
  ];
  for (const p of recordsPatterns) {
    const m = content.match(p);
    if (m && m[0]) {
      const text = m[0].replace(/【[^】]*】/g, "\n");
      // 按天分割，每天的内容作为一条记录
      const dayBlocks = text.split(/(?:\n|^)(?=第[一二三四五六七八九十\d]+天|Day\s*\d+)/i);
      for (const block of dayBlocks) {
        const cleaned = block
          .replace(/^[第\s\d一二三四五六七八九十]+[天\.\:：]*\s*/i, "")
          .replace(/[#*\📅📝🏆✨\-\—]+/g, " ")
          .trim();
        if (cleaned.length > 15) {
          result.records.push(cleaned.substring(0, 300));
        }
      }
      break;
    }
  }

  // 收获与反思
  const reflectionPatterns = [
    /【🌟\s*(?:收获与反思|核心收获|成长评估)\s*】[\s\S]*?(?=【[^】]*?】|$)/i,
    /【(?:收获与反思|核心收获|成长评估)\s*】[\s\S]*?(?=【[^】]*?】|$)/i,
  ];
  for (const p of reflectionPatterns) {
    const m = content.match(p);
    if (m && m[0]) {
      result.reflection = m[0]
        .replace(/【[^】]*】/g, "")
        .trim()
        .substring(0, 500);
      break;
    }
  }

  return result;
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<{ pdf: string; png: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

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

  const [toast, setToast] = useState<{msg:string;type:"ok"|"err"}|null>(null);

  const showToast = (msg: string, type: "ok"|"err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(report?.content || "");
      showToast("报告内容已复制！");
    } catch {
      showToast("复制失败，请重试", "err");
    }
  };

  const handleGenerateReport = useCallback(async () => {
    if (!report) return;
    setPreviewLoading(true);

    const parsed = parseReportContent(report.content);
    const props: PrintableReportProps = {
      studentName: report.studentName || "",
      school: report.school || "",
      grade: report.grade || "",
      base: report.base || "",
      theme: report.theme || report.name,
      date: report.date || "",
      summary: parsed.summary || report.content.substring(0, 300),
      records: parsed.records.length > 0 ? parsed.records : [report.content.substring(0, 200)],
      reflection: parsed.reflection,
      contactName: (report as any).contactName || "",
      contactPhone: (report as any).contactPhone || "",
    };

    try {
      const { pdf, png } = await generateReportPDF(props);
      setPreviewDataUrl({ pdf, png });
      setShowPreview(true);
    } catch (e) {
      showToast("生成报告失败，请重试", "err");
    } finally {
      setPreviewLoading(false);
    }
  }, [report]);

  const handleSaveImage = () => {
    if (!previewDataUrl?.png) return;
    const link = document.createElement("a");
    link.download = `研学报告_${report?.studentName || "学生"}_${report?.date || ""}.png`;
    link.href = previewDataUrl.png;
    link.click();
    showToast("已保存到相册");
  };

  if (!report) {
    return (
      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <p style={{ color: "#666" }}>加载中…</p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      {/* 顶部导航 */}
      <div style={{
        background: "linear-gradient(135deg, #01c3a3 0%, #00a88a 100%)",
        color: "white",
        padding: "12px 16px",
        paddingTop: "max(12px, env(safe-area-inset-top))",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}
        >
          ← 返回
        </button>
        <span style={{ fontSize: "16px", fontWeight: "600" }}>研学报告</span>
        <button
          onClick={() => router.push("/")}
          style={{ background: "none", border: "none", color: "white", fontSize: "14px", cursor: "pointer" }}
        >
          💬 继续咨询
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 60, left: "50%", transform: "translateX(-50%)",
          background: toast.type === "err" ? "#fee2e2" : "#d1fae5",
          color: toast.type === "err" ? "#991b1b" : "#065f46",
          padding: "10px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
          zIndex: 9999, boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          transition: "opacity 0.3s"
        }}>
          {toast.msg}
        </div>
      )}
      {/* 报告内容 */}
      <div style={{
        position: "absolute",
        top: "56px",
        left: 0,
        right: 0,
        bottom: "72px",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        padding: "16px",
        paddingBottom: "90px",
        overscrollBehavior: "contain",
      }}>
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
        background: "white",
        padding: "12px 16px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        boxShadow: "0 -2px 8px rgba(0,0,0,0.1)",
        display: "flex",
        gap: "10px",
        flexShrink: 0,
        zIndex: 10,
      }}>
        <button
          onClick={handleCopyContent}
          style={{
            flex: 1,
            padding: "14px",
            background: "white",
            border: "1.5px solid #01c3a3",
            borderRadius: "12px",
            color: "#01c3a3",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📋 复制内容
        </button>
        <button
          onClick={handleGenerateReport}
          disabled={previewLoading}
          style={{
            flex: 1,
            padding: "14px",
            background: previewLoading ? "#ccc" : "linear-gradient(135deg, #1a3a7a 0%, #0a2463 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: previewLoading ? "not-allowed" : "pointer",
          }}
        >
          {previewLoading ? "生成中..." : "🖨️ 生成可打印报告"}
        </button>
        <button
          onClick={() => router.push("/")}
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
          💬 继续咨询
        </button>
      </div>

      {/* 预览模态框 */}
      {showPreview && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.85)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
        }}>
          <div style={{
            padding: "12px 16px",
            paddingTop: "max(12px, env(safe-area-inset-top))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(0,0,0,0.3)",
            flexShrink: 0,
          }}>
            <span style={{ color: "white", fontSize: "16px", fontWeight: "600" }}>报告预览 - 竖版A4</span>
            <button
              onClick={() => setShowPreview(false)}
              style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}
            >
              ✕ 关闭
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <iframe
              src={previewDataUrl?.pdf}
              title="报告预览"
              sandbox="allow-same-origin allow-scripts"
              style={{ width: "100%", height: "85vh", maxWidth: 800, display: "block", margin: "0 auto", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", border: "none", background: "#fff" }}
            />
          </div>
          <div style={{
            padding: "16px",
            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
            display: "flex",
            gap: "12px",
            background: "rgba(0,0,0,0.3)",
            flexShrink: 0,
          }}>
            <button
              onClick={handleSaveImage}
              style={{
                flex: 1,
                padding: "14px",
                background: "#01c3a3",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              💾 保存到相册
            </button>
            <button
              onClick={() => setShowPreview(false)}
              style={{
                flex: 1,
                padding: "14px",
                background: "white",
                color: "#333",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← 返回
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
