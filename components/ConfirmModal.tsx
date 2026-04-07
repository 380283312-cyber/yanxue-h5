"use client";

import { useState } from "react";

interface FieldRow {
  label: string;
  value: string;
}

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  fields: FieldRow[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ visible, title, fields, onConfirm, onCancel }: ConfirmModalProps) {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px 20px 0 0",
          padding: "24px 20px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#0a2463", marginBottom: "4px" }}>
            {title}
          </div>
          <div style={{ fontSize: "13px", color: "#6b7280" }}>
            请确认以下填写内容，提交后将交由AI生成
          </div>
        </div>

        <div style={{ background: "#f9fafb", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
          {fields.map((f, i) => (
            <div key={i} style={{ display: "flex", gap: "8px", marginBottom: i < fields.length - 1 ? "10px" : 0 }}>
              <span style={{ color: "#6b7280", fontSize: "13px", flexShrink: 0, minWidth: "80px" }}>{f.label}：</span>
              <span style={{ color: "#374151", fontSize: "13px", fontWeight: 500, wordBreak: "break-all" }}>{f.value || "（未填写）"}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "13px",
              background: "white",
              border: "1.5px solid #e5e7eb",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: 600,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            返回修改
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "13px",
              background: "linear-gradient(135deg, #0a2463 0%, #1a3a7a 100%)",
              border: "none",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: 700,
              color: "white",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(10,36,99,0.3)",
            }}
          >
            确认提交
          </button>
        </div>
      </div>
    </div>
  );
}
