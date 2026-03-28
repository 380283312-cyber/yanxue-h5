"use client";

import { useState } from "react";

export default function BusinessPanel() {
  const [type, setType] = useState<"org" | "school">("org");
  const [test, setTest] = useState("");

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#0a2463", fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
        🏢 B端服务
      </h2>
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <button
          onClick={() => setType("org")}
          style={{
            flex: 1,
            padding: "12px",
            background: type === "org" ? "#01C3A3" : "#f3f4f6",
            color: type === "org" ? "white" : "#666",
            border: "none",
            borderRadius: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🏢 机构版
        </button>
        <button
          onClick={() => setType("school")}
          style={{
            flex: 1,
            padding: "12px",
            background: type === "school" ? "#01C3A3" : "#f3f4f6",
            color: type === "school" ? "white" : "#666",
            border: "none",
            borderRadius: "12px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🏫 学校版
        </button>
      </div>
      <div style={{ padding: "20px", background: "#f9fafb", borderRadius: "12px", fontSize: "14px", color: "#374151" }}>
        {type === "org" ? "🏢 机构版：输入营地信息，生成专属宣传材料" : "🏫 学校版：输入学校信息，生成研学活动方案"}
      </div>
      <div style={{ marginTop: "16px", padding: "12px", background: "#d1fae5", borderRadius: "8px", fontSize: "13px", color: "#065f46" }}>
        React 渲染正常！type={type}
      </div>
    </div>
  );
}
