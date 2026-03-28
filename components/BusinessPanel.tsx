"use client";

// Self-contained test component
export default function BusinessPanel() {
  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#0a2463", marginBottom: "12px" }}>🏢 B端服务</h2>
      <p style={{ color: "#666", fontSize: "14px" }}>
        这是 B端服务 Tab 的内容。
      </p>
      <p style={{ color: "#01C3A3", fontSize: "13px", marginTop: "12px" }}>
        如果你看到这段文字，说明组件渲染正常！
      </p>
    </div>
  );
}
