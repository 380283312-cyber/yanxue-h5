"use client";

import { useState } from "react";
import Link from "next/link";

export default function BizPage() {
  const [type, setType] = useState<"org" | "school">("org");
  const [orgName, setOrgName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const handleGenerate = async () => {
    if (!orgName.trim()) return;
    setLoading(true);
    setResult("");
    // Simulate AI generation - replace with real API call later
    setTimeout(() => {
      setResult(`✅ 已为「${orgName}」生成宣传材料！\n\n（完整功能正在开发中，即将上线）`);
      setLoading(false);
    }, 2000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #01C3A3 0%, #01879A 100%)", color: "white", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px" }}>
        <Link href="/" style={{ color: "white", fontSize: "14px", textDecoration: "none" }}>← 返回</Link>
        <span style={{ fontSize: "17px", fontWeight: 600 }}>🏢 B端服务</span>
      </div>

      {/* Content */}
      <div style={{ padding: "20px 16px" }}>
        {/* Type toggle */}
        <div style={{ display: "flex", gap: "8px", background: "#e5e7eb", borderRadius: "16px", padding: "4px", marginBottom: "20px" }}>
          <button
            onClick={() => setType("org")}
            style={{
              flex: 1, padding: "10px", borderRadius: "12px",
              background: type === "org" ? "white" : "transparent",
              color: type === "org" ? "#01C3A3" : "#6b7280",
              border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer",
            }}
          >
            🏢 机构版
          </button>
          <button
            onClick={() => setType("school")}
            style={{
              flex: 1, padding: "10px", borderRadius: "12px",
              background: type === "school" ? "white" : "transparent",
              color: type === "school" ? "#01C3A3" : "#6b7280",
              border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer",
            }}
          >
            🏫 学校版
          </button>
        </div>

        {/* Form */}
        <div style={{ background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#0a2463", fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>
            {type === "org" ? "🏢 机构宣传材料生成" : "🏫 学校研学方案生成"}
          </h2>
          <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px" }}>
            {type === "org"
              ? "输入机构信息，AI 生成专属宣传页、家长信、行程大纲"
              : "输入学校和活动信息，AI 生成完整研学方案、家长信、安全预案"}
          </p>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", color: "#374151", fontSize: "13px", fontWeight: 500, marginBottom: "6px" }}>
              {type === "org" ? "机构名称 *" : "学校名称 *"}
            </label>
            <input
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #e5e7eb", borderRadius: "12px", fontSize: "15px", outline: "none", boxSizing: "border-box" }}
              placeholder={type === "org" ? "例如：北京探知研学基地" : "例如：北京市第一中学"}
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={!orgName.trim() || loading}
            style={{
              width: "100%", padding: "14px", marginTop: "8px",
              background: orgName.trim() && !loading
                ? "linear-gradient(135deg, #01C3A3 0%, #01879A 100%)"
                : "#d1d5db",
              color: "white", border: "none", borderRadius: "16px",
              fontSize: "16px", fontWeight: 600, cursor: orgName.trim() && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "🔄 生成中..." : "🚀 一键生成宣传材料"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ marginTop: "16px", background: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div style={{ color: "#374151", fontSize: "14px", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
}
