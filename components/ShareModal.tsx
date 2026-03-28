"use client";

import { useEffect, useState } from "react";
import PosterCanvas from "./PosterCanvas";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

const SHARE_URL = "https://www.woaiyanxue.cn";
const SHARE_TITLE = "研学AI助手 - 智能规划研学之旅";
const SHARE_DESC = "输入目的地和天数，AI帮你生成完整研学方案";

export default function ShareModal({ visible, onClose }: ShareModalProps) {
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [posterKey, setPosterKey] = useState(0);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleCopy = async () => {
    const shareText = `${SHARE_TITLE}\n${SHARE_DESC}\n\n👉 ${SHARE_URL}`;
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("已复制到剪贴板");
    } catch {
      showToast("复制失败，长按复制：\n" + SHARE_URL);
    }
  };

  const handleDownloadPoster = () => {
    setPosterKey((k) => k + 1);
    showToast("海报生成中...");
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
          <div className="share-card-preview">
            <div className="share-card-preview-title">{SHARE_TITLE}</div>
            <div className="share-card-preview-desc">{SHARE_DESC}</div>
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

      {posterKey > 0 && <PosterCanvas key={posterKey} url={SHARE_URL} />}
    </>
  );
}
