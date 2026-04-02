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
}

const SHARE_URL = "https://www.woaiyanxue.cn";
const SHARE_TITLE = "🎓 帮学校生成研学方案 · 帮家长生成研学报告";
const SHARE_DESC = "输入目的地和天数，AI 5秒生成完整研学行程、家长信、研学报告，完全免费";

export default function ShareModal({ visible, onClose, posterType = "general", bgType = "palace", onBgTypeChange, reportData }: ShareModalProps) {
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [posterKey, setPosterKey] = useState(0);

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

  const handleDownloadPoster = () => {
    setPosterKey((k) => k + 1);
    showToast(posterType === "report" ? "研学纪念卡生成中..." : "海报生成中...");
  };

  // Detect if inside WeChat
  const isWechat = typeof window !== "undefined" && !!(window as any).wx;

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
          <h3 className="share-modal-title">分享给好友</h3>

          {/* Link card */}

          {/* BG type selector for report poster */}
          {posterType === "report" && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: "8px", textAlign: "center" }}>
                选择海报背景
              </div>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button
                  onClick={() => onBgTypeChange?.("palace")}
                  style={{
                    border: bgType === "palace" ? "2px solid #C9A84C" : "2px solid #e0e0e0",
                    borderRadius: "10px",
                    padding: "6px",
                    background: "#fafafa",
                    cursor: "pointer",
                    width: "120px",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    src="/bg-palace-thumb.jpg"
                    alt="故宫"
                    style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div style={{ fontSize: "11px", color: bgType === "palace" ? "#C9A84C" : "#666", marginTop: "4px", fontWeight: bgType === "palace" ? "bold" : "normal" }}>
                    🏯 故宫
                  </div>
                </button>
                <button
                  onClick={() => onBgTypeChange?.("mountain")}
                  style={{
                    border: bgType === "mountain" ? "2px solid #C9A84C" : "2px solid #e0e0e0",
                    borderRadius: "10px",
                    padding: "6px",
                    background: "#fafafa",
                    cursor: "pointer",
                    width: "120px",
                    transition: "all 0.2s",
                  }}
                >
                  <img
                    src="/bg-yellow-mountain-thumb.jpg"
                    alt="黄山"
                    style={{ width: "100%", height: "70px", objectFit: "cover", borderRadius: "6px", display: "block" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div style={{ fontSize: "11px", color: bgType === "mountain" ? "#C9A84C" : "#666", marginTop: "4px", fontWeight: bgType === "mountain" ? "bold" : "normal" }}>
                    🏔️ 黄山
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Main actions — 2 large primary buttons */}
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
                ✈️ 帮学校 → 5秒生成研学方案/家长信<br/>
                📄 帮家长 → 生成研学报告/研学证书<br/>
                💰 完全免费
              </div>
            </div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              {SHARE_URL}
            </div>
          </div>

          {/* Main actions — 2 large primary buttons */}
          <div className="share-primary-actions">
            <button
              className="share-primary-btn poster"
              onClick={handleDownloadPoster}
            >
              <div className="share-primary-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <path d="M3 9h18"/>
                  <path d="M9 21V9"/>
                </svg>
              </div>
              <span className="share-primary-label">保存海报</span>
              <span className="share-primary-sub">发到微信 · 长按识别</span>
            </button>

            <button
              className="share-primary-btn copy"
              onClick={handleCopy}
            >
              <div className="share-primary-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </div>
              <span className="share-primary-label">复制链接</span>
              <span className="share-primary-sub">粘贴给好友</span>
            </button>
          </div>

          {/* WeChat tip */}
          <div className="share-wechat-tip">
            <span>在微信中直接打开本页面</span>
            <span className="share-wechat-tip-arrow">→</span>
            <span>点右上角 ··· 分享给朋友/朋友圈</span>
          </div>

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
        />
      ) : posterKey > 0 ? (
        <PosterCanvas key={posterKey} url={SHARE_URL} />
      ) : null}
    </>
  );
}
