"use client";

import { useState } from "react";
import ShareModal from "./ShareModal";

export default function Header() {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">🎓</div>
          <span className="header-title">研学AI助手</span>
        </div>
        <div className="header-actions">
          <a href="/biz" className="share-btn biz-link">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            B端服务
          </a>
          <button
            className="share-btn"
            onClick={() => setShowShare(true)}
            aria-label="分享"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            分享
          </button>
        </div>
      </header>
      <ShareModal visible={showShare} onClose={() => setShowShare(false)} />
    </>
  );
}
