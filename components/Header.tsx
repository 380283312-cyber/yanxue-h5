"use client";

interface HeaderProps {
  onShareClick: () => void;
}

export default function Header({ onShareClick }: HeaderProps) {
  return (
    <>
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">🎓</div>
          <span className="header-title">研学AI助手</span>
        </div>
        <div className="header-actions">
          <button
            className="share-btn"
            onClick={onShareClick}
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
    </>
  );
}
