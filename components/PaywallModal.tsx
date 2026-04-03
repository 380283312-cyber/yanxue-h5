"use client";

import { useEffect, useState } from "react";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  /** 当前是哪种操作触发的，用于文案的差异化 */
  actionType: "chat" | "itinerary" | "report";
  /** 解锁按钮点击 */
  onUnlock: () => void;
}

const ACTION_TITLES = {
  chat: "今日免费对话次数已用完",
  itinerary: "今日免费行程生成已用完",
  report: "今日免费报告生成已用完",
};

const ACTION_DESCS = {
  chat: "继续和研学顾问小智对话，探索更多目的地和课程",
  itinerary: "解锁完整行程规划，生成可执行的研学方案",
  report: "生成更完整的研学报告，包含证书和精彩瞬间",
};

const PLANS = [
  {
    label: "体验版",
    price: "¥0",
    period: "/月",
    badge: "当前",
    features: ["每日3次免费", "行程规划", "报告生成", "微信分享"],
    highlight: false,
    disabled: true,
  },
  {
    label: "月度会员",
    price: "¥9.9",
    period: "/月",
    badge: "推荐",
    features: ["无限次使用", "优先AI响应", "专属家长信模板", "班级群适配"],
    highlight: true,
    disabled: false,
  },
  {
    label: "年度会员",
    price: "¥99",
    period: "/年",
    badge: "超值",
    features: ["全部月度特权", "基地入驻展示", "招生文案生成", "专属客服"],
    highlight: false,
    disabled: false,
  },
];

export default function PaywallModal({
  visible,
  onClose,
  actionType,
  onUnlock,
}: PaywallModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<number>(1); // default to 2nd plan
  const [processing, setProcessing] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (visible) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  const handleConfirm = () => {
    const plan = PLANS[selectedPlan];
    if (plan.disabled) return;
    setProcessing(true);
    // Simulate payment flow — in production this triggers WeChat/Alipay
    setTimeout(() => {
      onUnlock();
      setProcessing(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="paywall-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="paywall-modal">
        {/* Header */}
        <div className="paywall-header">
          <div className="paywall-icon">🎁</div>
          <h2 className="paywall-title">{ACTION_TITLES[actionType]}</h2>
          <p className="paywall-desc">{ACTION_DESCS[actionType]}</p>
        </div>

        {/* Plans */}
        <div className="paywall-plans">
          {PLANS.map((plan, idx) => (
            <div
              key={idx}
              className={`paywall-plan ${plan.highlight ? "highlight" : ""} ${selectedPlan === idx ? "selected" : ""} ${plan.disabled ? "disabled" : ""}`}
              onClick={() => !plan.disabled && setSelectedPlan(idx)}
            >
              {plan.badge && (
                <span className={`plan-badge ${plan.highlight ? "badge-hot" : ""}`}>
                  {plan.badge}
                </span>
              )}
              <div className="plan-label">{plan.label}</div>
              <div className="plan-price">
                <span className="price-num">{plan.price}</span>
                <span className="price-period">{plan.period}</span>
              </div>
              <ul className="plan-features">
                {plan.features.map((f, fi) => (
                  <li key={fi}>✓ {f}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="paywall-actions">
          <button className="paywall-btn-secondary" onClick={onClose}>
            稍后再说
          </button>
          <button
            className={`paywall-btn-primary ${processing ? "processing" : ""}`}
            onClick={handleConfirm}
            disabled={processing || PLANS[selectedPlan].disabled}
          >
            {processing ? "跳转支付..." : `立即解锁 ${PLANS[selectedPlan].price}`}
          </button>
        </div>

        <p className="paywall-note">
          支付安全由微信支付/支付宝保障 · 随时可取消
        </p>
      </div>

      <style jsx>{`
        .paywall-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          z-index: 9999;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0;
        }
        .paywall-modal {
          background: #fff;
          border-radius: 24px 24px 0 0;
          padding: 32px 24px 40px;
          width: 100%;
          max-width: 480px;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .paywall-header {
          text-align: center;
          margin-bottom: 24px;
        }
        .paywall-icon { font-size: 48px; margin-bottom: 8px; }
        .paywall-title {
          font-size: 20px;
          font-weight: 700;
          color: #1a2a4a;
          margin: 0 0 8px;
        }
        .paywall-desc {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        .paywall-plans {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        .paywall-plan {
          flex: 1;
          background: #f8f8f8;
          border: 2px solid transparent;
          border-radius: 16px;
          padding: 14px 10px;
          cursor: pointer;
          position: relative;
          transition: all 0.2s;
        }
        .paywall-plan.selected {
          border-color: #01c3a3;
          background: #f0fdf9;
        }
        .paywall-plan.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .paywall-plan.highlight {
          background: linear-gradient(135deg, #01c3a3 0%, #00a890 100%);
          color: white;
        }
        .paywall-plan.highlight .plan-features li {
          color: rgba(255,255,255,0.85);
        }
        .plan-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #ff6b35;
          color: white;
          font-size: 10px;
          padding: 2px 6px;
          border-radius: 8px;
          font-weight: 600;
        }
        .badge-hot {
          background: #ff6b35;
        }
        .plan-label {
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 4px;
          text-align: center;
        }
        .plan-price {
          text-align: center;
          margin-bottom: 8px;
        }
        .price-num {
          font-size: 20px;
          font-weight: 800;
        }
        .price-period {
          font-size: 11px;
          opacity: 0.7;
        }
        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .plan-features li {
          font-size: 10px;
          color: #555;
          margin-bottom: 3px;
          line-height: 1.3;
        }
        .paywall-actions {
          display: flex;
          gap: 12px;
        }
        .paywall-btn-secondary {
          flex: 1;
          padding: 14px;
          border: 1.5px solid #e0e0e0;
          background: white;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
        }
        .paywall-btn-primary {
          flex: 2;
          padding: 14px;
          border: none;
          background: linear-gradient(135deg, #01c3a3 0%, #00a890 100%);
          border-radius: 12px;
          font-size: 15px;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .paywall-btn-primary.processing {
          opacity: 0.7;
        }
        .paywall-btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .paywall-note {
          text-align: center;
          font-size: 11px;
          color: #aaa;
          margin: 16px 0 0;
        }
      `}</style>
    </div>
  );
}
