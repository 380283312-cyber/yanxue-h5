"use client";

import { useEffect, useState } from "react";
import PosterCanvas from "./PosterCanvas";
import ReportPosterCanvas from "./ReportPosterCanvas";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  posterType?: "report" | "general";
  bgType?: "palace" | "mountain";
  onBgTypeChange?: (bg: "palace" | "mountain") => void;
  reportData?: {
    studentName: string;
    school: string;
    grade: string;
    base: string;
    theme: string;
    date: string;
  };
  reportSummary?: string;
}

const SHARE_URL = "https://www.woaiyanxue.cn";

export default function ShareModal({
  visible,
  onClose,
  posterType = "general",
  bgType = "palace",
  onBgTypeChange,
  reportData,
  reportSummary,
}: ShareModalProps) {
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [posterKey, setPosterKey] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null);

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

  const handleGeneratePoster = () => {
    setPosterDataUrl(null);
    setGenerating(true);
    setPosterKey((k) => k + 1);
    showToast(posterType === "report" ? "研学纪念卡生成中..." : "海报生成中...");
  };

  const handleSavePoster = () => {
    if (!posterDataUrl) return;
    const a = document.createElement("a");
    a.href = posterDataUrl;
    a.download = "研学结业纪念卡.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("已保存到相册");
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

  const THUMBNAILS = {
    palace: "/bg-palace-thumb.jpg",
    mountain: "/bg-yellow-mountain-thumb.jpg",
  };

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
          <h3 className="share-modal-title">
            {posterDataUrl ? "预览纪念卡" : "分享给好友"}
          </h3>

          {/* ── 预览模式 ─────────────────────────────────────── */}
          {posterDataUrl && posterType === "report" ? (
            <div style={{ marginBottom: "12px" }}>
              <div style={{
                border: "2px solid #C9A84C",
                borderRadius: "12px",
                overflow: "hidden",
                maxHeight: "480px",
                overflowY: "auto",
                background: "#faf6ee",
              }}>
                <img
                  src={posterDataUrl}
                  alt="研学纪念卡预览"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              <p style={{ fontSize: "12px", color: "#999", textAlign: "center", margin: "8px 0 12px" }}>
                长按图片可直接保存到相册
              </p>
              <button
                onClick={handleSavePoster}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #C9A84C, #e8c96a)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  marginBottom: "8px",
                }}
              >
                📥 保存到相册
              </button>
              <button
                onClick={() => { setPosterDataUrl(null); setGenerating(false); }}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "#f5f5f5",
                  color: "#666",
                  border: "none",
                  borderRadius: "10px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ← 重新生成
              </button>
            </div>
          ) : (
            <>
              {/* ── 生成阶段：背景选择 ─────────────────────────── */}
              {posterType === "report" && !generating && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", textAlign: "center" }}>
                    选择海报背景
                  </div>
                  <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                    {(["palace", "mountain"] as const).map((bg) => (
                      <button
                        key={bg}
                        onClick={() => onBgTypeChange?.(bg)}
                        style={{
                          border: bgType === bg ? "2px solid #C9A84C" : "2px solid #e0e0e0",
                          borderRadius: "10px",
                          padding: "6px",
                          background: "#fafafa",
                          cursor: "pointer",
                          width: "120px",
                          transition: "all 0.2s",
                        }}
                      >
                        <img
                          src={THUMBNAILS[bg]}
                          alt={bg === "palace" ? "古典信纸" : "现代信纸"}
                          style={{
                            width: "100%",
                            height: "70px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            display: "block",
                            background: "#e8e4dc",
                          }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div style={{
                          fontSize: "11px",
                          color: bgType === bg ? "#C9A84C" : "#666",
                          marginTop: "4px",
                          fontWeight: bgType === bg ? "bold" : "normal",
                        }}>
                          {bg === "palace" ? "📜 古典信纸" : "📋 现代信纸"}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 生成中提示（还未有 posterDataUrl） */}
              {generating && !posterDataUrl && (
                <div style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "#666",
                  fontSize: "14px",
                }}>
                  <div className="spinner" style={{
                    borderTopColor: "#C9A84C",
                    borderColor: "rgba(201,168,76,0.3)",
                    width: "32px",
                    height: "32px",
                    margin: "0 auto 12px",
                  }} />
                  正在生成纪念卡，请稍候…
                </div>
              )}

              {/* Link card (非预览模式) */}
              {!generating && (
                <div className="share-card-preview" style={{
                  background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)"
                }}>
                  <div className="share-card-preview-title" style={{
                    fontSize: "16px",
                    fontWeight: "800",
                    color: "#fff",
                    lineHeight: "1.5",
                    marginBottom: "8px"
                  }}>
                    🎓 研学AI助手
                  </div>
                  <div style={{
                    background: "rgba(1,195,163,0.15)",
                    border: "1px solid rgba(1,195,163,0.3)",
                    borderRadius: "10px",
                    padding: "10px 12px",
                    marginBottom: "10px"
                  }}>
                    <div style={{ fontSize: "13px", color: "#fff", lineHeight: "1.7", fontWeight: "500" }}>
                      ✈️ 帮学校 → 5秒生成研学方案/家长信<br />
                      📄 帮家长 → 生成研学报告/研学证书<br />
                      💰 完全免费
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
                    {SHARE_URL}
                  </div>
                </div>
              )}

              {/* 主操作按钮 */}
              {!generating && (
                <div className="share-primary-actions">
                  {posterType === "report" && (
                    <button
                      className="share-primary-btn poster"
                      onClick={handleGeneratePoster}
                    >
                      <div className="share-primary-icon">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M3 9h18" />
                          <path d="M9 21V9" />
                        </svg>
                      </div>
                      <span className="share-primary-label">生成纪念卡</span>
                      <span className="share-primary-sub">预览后再保存</span>
                    </button>
                  )}

                  <button
                    className="share-primary-btn copy"
                    onClick={handleCopy}
                  >
                    <div className="share-primary-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    </div>
                    <span className="share-primary-label">复制链接</span>
                    <span className="share-primary-sub">粘贴给好友</span>
                  </button>
                </div>
              )}

              {/* WeChat tip */}
              {!generating && (
                <div className="share-wechat-tip">
                  <span>在微信中直接打开本页面</span>
                  <span className="share-wechat-tip-arrow">→</span>
                  <span>点右上角 ··· 分享给朋友/朋友圈</span>
                </div>
              )}
            </>
          )}

          <button className="share-cancel-btn" onClick={onClose}>
            取消
          </button>
        </div>
      </div>

      <div className={`toast ${toastVisible ? "visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>

      {posterKey > 0 && posterType === "report" && reportData ? (
        <ReportPosterCanvas
          key={posterKey}
          url={SHARE_URL}
          studentName={reportData.studentName}
          school={reportData.school}
          grade={reportData.grade}
          base={reportData.base}
          theme={reportData.theme}
          date={reportData.date}
          bgType={bgType}
          reportSummary={reportSummary}
          onDataUrlReady={(dataUrl) => {
            setPosterDataUrl(dataUrl);
            setGenerating(false);
          }}
        />
      ) : posterKey > 0 ? (
        <PosterCanvas key={posterKey} url={SHARE_URL} />
      ) : null}
    </>
  );
}
