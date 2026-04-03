"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import PrintableReportCanvas, { generateReportImage, PrintableReportProps } from "@/components/PrintableReportCanvas";

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

  const summaryMatch = content.match(/【研学概要】[\s\S]*?(?=【【)/);
  if (summaryMatch) {
    result.summary = summaryMatch[0].replace(/【研学概要】/g, "").trim();
  }

  const recordsMatch = content.match(/【(?:详细记录|研学记录)】[\s\S]*?(?=【)/);
  if (recordsMatch) {
    const recordsText = recordsMatch[0];
    const dayMatches = recordsText.matchAll(/(?:第[一二三四五六七八九十\d]+天|Day\s*\d+)[:：]\s*([^\n【]+)/gi);
    for (const match of dayMatches) {
      result.records.push(match[1].trim());
    }
  }

  const reflectionMatch = content.match(/【(?:核心收获|收获与反思|成长评估)】[\s\S]*?(?=【|$)/);
  if (reflectionMatch) {
    result.reflection = reflectionMatch[0].replace(/【(?:核心收获|收获与反思|成长评估)】/g, "").trim();
  }

  return result;
}

export default function ReportPage() {
  const router = useRouter();
  const [report, setReport] = useState<ReportData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState("");
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

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(report?.content || "");
      alert("报告内容已复制！");
    } catch {
      alert("复制失败");
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
      summary: parsed.summary,
      records: parsed.records.length > 0 ? parsed.records : ["", "", ""],
      reflection: parsed.reflection,
    };

    try {
      const dataUrl = await generateReportImage(props);
      setPreviewDataUrl(dataUrl);
      setShowPreview(true);
    } catch (e) {
      alert("生成报告图片失败");
    } finally {
      setPreviewLoading(false);
    }
  }, [report]);

  const handleSaveImage = () => {
    if (!previewDataUrl) return;
    const link = document.createElement("a");
    link.download = `研学报告_${report?.studentName || "学生"}_${report?.date || ""}.png`;
    link.href = previewDataUrl;
    link.click();
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

      {/* 报告内容 - 独立滚动区域 */}
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
            <span style={{ color: "white", fontSize: "16px", fontWeight: "600" }}>报告预览</span>
            <button
              onClick={() => setShowPreview(false)}
              style={{ background: "none", border: "none", color: "white", fontSize: "16px", cursor: "pointer" }}
            >
              ✕ 关闭
            </button>
          </div>
          <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
            <img
              src={previewDataUrl}
              alt="报告预览"
              style={{ width: "100%", maxWidth: 800, display: "block", margin: "0 auto", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}
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