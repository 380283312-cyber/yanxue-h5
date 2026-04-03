"use client";

import { useEffect, useState } from "react";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHARE_URL = "https://www.woaiyanxue.cn";

export default function ShareModal({
  visible,
  onClose,
}: ShareModalProps) {
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleCopy = async () => {
    const shareText = `🎓 研学AI助手\n\n帮学校快速生成研学方案、家长信、安全预案\n帮家长生成研学报告、研学证书\n\n免费用，5秒出结果 👉\n${SHARE_URL}`;
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败，长按复制：\n" + SHARE_URL);
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (visible) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [visible, onClose]);

  return (
    <>
      <div
        className={`share-modal-overlay ${visible ? "visible" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-label="分享"
      >
        <div className="share-modal">
          <h3 className="share-modal-title">分享研学助手</h3>

          <div className="share-card-preview">
            <div className="share-card-preview-title">🎓 研学AI助手</div>
            <div style={{ fontSize: "13px", color: "#fff", lineHeight: "1.7" }}>
              帮学校5秒生成研学方案 · 帮家长生成研学报告<br />
              完全免费，立即体验
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "8px" }}>
              {SHARE_URL}
            </div>
          </div>

          <button
            onClick={handleCopy}
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
              marginTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            复制链接
          </button>

          <div style={{
            background: "#f0fdf9",
            border: "1px solid rgba(1,195,163,0.3)",
            borderRadius: "10px",
            padding: "10px 14px",
            marginTop: "12px",
            fontSize: "12px",
            color: "#065f56",
            lineHeight: "1.6",
          }}>
            💡 <strong>微信内分享：</strong>复制链接后粘贴给朋友<br />
            📱 <strong>浏览器中打开：</strong>点分享按钮可直接发微信/朋友圈
          </div>

          <button className="share-cancel-btn" onClick={onClose}>关闭</button>
        </div>
      </div>

      <div className={`toast ${toastVisible ? "visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}