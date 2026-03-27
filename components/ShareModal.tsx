"use client";

import { useEffect, useState } from "react";

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShareModal({ visible, onClose }: ShareModalProps) {
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = (msg: string) => {
    setToast(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCopy = async () => {
    const shareText = `研学AI助手 - 智能规划研学之旅\n输入目的地和天数，AI帮你生成完整研学方案\n\n👉 https://yanxue-ai.vercel.app`;
    try {
      await navigator.clipboard.writeText(shareText);
      showToast("链接已复制到剪贴板");
    } catch {
      showToast("复制失败，请手动复制");
    }
  };

  const handleWechatShare = () => {
    // In WeChat browser, use JSSDK
    if (typeof window !== "undefined" && (window as any).wx) {
      (window as any).wx.ready(() => {
        (window as any).wx.shareAppMessage({
          title: "研学AI助手 - 智能规划研学之旅",
          desc: "输入目的地和天数，AI帮你生成完整研学方案",
          link: "https://yanxue-ai.vercel.app",
          imgUrl: "https://yanxue-ai.vercel.app/icon.png",
          success: () => showToast("分享成功"),
          fail: () => showToast("分享失败"),
        });
      });
    } else {
      // Not in WeChat, show copy option
      handleCopy();
    }
  };

  // Close on escape
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

          <div className="share-card-preview">
            <div className="share-card-preview-title">研学AI助手 - 智能规划研学之旅</div>
            <div className="share-card-preview-desc">
              输入目的地和天数，AI帮你生成完整研学方案
            </div>
            <div className="share-card-preview-img">🎓</div>
          </div>

          <div className="share-actions">
            <button className="share-action-item" onClick={handleWechatShare}>
              <div className="share-action-icon wechat">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.5 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm5.5 5.1c-.4-.2-.8-.4-1.2-.5.4-.4.7-.9.9-1.4.4-.9.5-2 .3-2.9-.5.2-1 .3-1.5.5-.5-1.4-1.4-2.4-2.5-3.1-.3-.2-.7-.3-1-.5-.8-.4-1.7-.6-2.5-.6-2.2 0-4.1 1.2-5.2 3-.3.5-.5 1.1-.6 1.7C5.1 9.7 3.5 7.7 3.5 5.3 3.5 2.9 5.4 1 7.8 1c1.4 0 2.7.7 3.5 1.8.5.7.8 1.5.9 2.4.9-.6 1.9-1 3-1 2.8 0 5 2.2 5 5 0 .5-.1 1-.2 1.4.2 0 .3.1.5.1.8 0 1.5-.3 2-.7z"/>
                </svg>
              </div>
              <span className="share-action-label">微信</span>
            </button>

            <button className="share-action-item" onClick={handleWechatShare}>
              <div className="share-action-icon friend">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="share-action-label">朋友圈</span>
            </button>

            <button className="share-action-item" onClick={handleCopy}>
              <div className="share-action-icon copy">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </div>
              <span className="share-action-label">复制链接</span>
            </button>
          </div>

          <button className="share-cancel-btn" onClick={onClose}>
            取消
          </button>
        </div>
      </div>

      <div className={`toast ${toastVisible ? "visible" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
