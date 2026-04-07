"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ItineraryShareCard, { ItineraryShareCardProps } from "./ItineraryShareCard";
import { buildSystemPrompt, streamChatViaAPI } from "@/lib/minimax";

export interface ItineraryShareSheetProps {
  visible: boolean;
  onClose: () => void;
  destination: string;
  days: string;
  grade: string;
  content: string;
  budget?: string;
  intentionBase?: string;
  contactName?: string;
  contactPhone?: string;
}

export default function ItineraryShareSheet(props: ItineraryShareSheetProps) {
  const [cardImageUrl, setCardImageUrl] = useState<string>("");
  const [xiaohongshuContent, setXiaohongshuContent] = useState<string>("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [contactName, setContactName] = useState<string>(props.contactName || "");
  const [contactPhone, setContactPhone] = useState<string>(props.contactPhone || "");
  const cardRef = useRef<HTMLDivElement>(null);

  const generateXiaohongshuContent = useCallback(async () => {
    setIsGeneratingContent(true);
    const systemContent = buildSystemPrompt();
    const prompt = `请根据以下研学行程方案，生成一段适合小红书的种草文案，100-200字，带emoji，带话题标签。行程方案：
${props.content}

请按以下格式生成：
🏫 {目的地}研学之旅 | {天数}天{年级}版

✨ 孩子的成长需要一场说走就走的研学
这次我们去了{destination}，{一句话亮点描述}

📍 行程亮点：
{3个亮点，每点一行带emoji}

📅 行程安排：
{每天一行，最多5天}

💰 预算：{费用}
👨‍👩‍👧 适合：{年级}

想带孩子体验的家长，评论区扣"1"！

#研学旅行 #亲子教育 #{目的地}研学`;

    let fullResponse = "";
    try {
      await streamChatViaAPI({
        messages: [
          { role: "user" as const, content: systemContent },
          { role: "user" as const, content: prompt },
        ],
        onChunk: (text: string) => {
          fullResponse += text;
          setXiaohongshuContent(fullResponse);
        },
        onDone: () => setIsGeneratingContent(false),
        onError: () => {
          setXiaohongshuContent(generateDefaultContent());
          setIsGeneratingContent(false);
        },
      });
    } catch {
      setXiaohongshuContent(generateDefaultContent());
      setIsGeneratingContent(false);
    }
  }, [props.content, props.destination, props.days, props.grade, props.budget]);

  const generateDefaultContent = (): string => {
    return `🏫 ${props.destination}研学之旅 | ${props.days}天${props.grade}版

✨ 孩子的成长需要一场说走就走的研学
这次我们去了${props.destination}，开启了一段难忘的研学之旅！

📍 行程亮点：
�历史文化底蕴深厚
🛠️ 动手实践乐趣多
🌿 亲近自然乐趣多

📅 行程安排：
${props.content.slice(0, 200)}...

💰 预算：${props.budget || "待定"}
👨‍👩‍👧 适合：${props.grade}

想带孩子体验的家长，评论区扣"1"！

#研学旅行 #亲子教育 #${props.destination}研学`;
  };

  useEffect(() => {
    if (props.visible && !xiaohongshuContent) {
      generateXiaohongshuContent();
    }
  }, [props.visible, xiaohongshuContent, generateXiaohongshuContent]);

  const handleSaveImage = async () => {
    if (!cardRef.current) return;

    const canvas = document.createElement("canvas");
    const W = 540;
    const padding = 24;
    let y = 40;

    // Parse content into structured lines
    const lines = parseContentLines(props.content);

    // Calculate dynamic height
    const headerHeight = 40 + 28 + 30 + 10; // destination + title + divider
    const lineHeight = 22;
    const bottomSection = 24 + 24 + 80 + 16; // budget + grade + qr area + bottom gradient
    const H = Math.max(600, headerHeight + (lines.length * lineHeight) + bottomSection);

    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cardProps: ItineraryShareCardProps = {
      destination: props.destination,
      days: props.days,
      grade: props.grade,
      content: props.content,
      budget: props.budget,
      intentionBase: props.intentionBase,
      contactName: contactName || undefined,
      contactPhone: contactPhone || undefined,
    };

    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, 0, W, H);

    const gradient = ctx.createLinearGradient(0, 0, W, 8);
    gradient.addColorStop(0, "#01c3a3");
    gradient.addColorStop(1, "#00a88a");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, W, 8);

    ctx.fillStyle = "#faf8f4";
    ctx.fillRect(0, H - 16, W, 16);
    const bottomGradient = ctx.createLinearGradient(0, H - 16, W, H);
    bottomGradient.addColorStop(0, "#01c3a3");
    bottomGradient.addColorStop(1, "#00a88a");
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, H - 16, W, 16);

    ctx.fillStyle = "#01c3a3";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`📍 ${props.destination} ${props.days}天`, padding, y);

    y += 28;
    ctx.fillStyle = "#1a3a7a";
    ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    const title = props.intentionBase ? `${props.intentionBase} · 研学方案` : "🎓 研学旅行方案";
    ctx.fillText(title, padding, y);

    y += 30;
    ctx.strokeStyle = "rgba(26, 58, 122, 0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(W - padding, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 20;
    ctx.fillStyle = "#4b5563";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";

    lines.forEach((line) => {
      ctx.fillText(line, padding, y);
      y += lineHeight;
    });

    y += 10;
    ctx.strokeStyle = "rgba(26, 58, 122, 0.15)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(W - padding, y);
    ctx.stroke();
    ctx.setLineDash([]);

    y += 24;
    if (props.budget) {
      ctx.fillText(`💰 费用：${props.budget}`, padding, y);
      y += 22;
    }
    ctx.fillText(`📅 适合：${props.grade}`, padding, y);

    try {
      const QRCode = (await import("qrcode")).default;
      const qrUrl = `https://www.woaiyanxue.cn/itinerary?dest=${encodeURIComponent(props.destination)}`;
      const qrDataUrl = await QRCode.toDataURL(qrUrl, {
        width: 70,
        margin: 2,
        color: { dark: "#1a3a7a", light: "#ffffff" },
      });

      const img = new Image();
      img.src = qrDataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          const qrX = W - padding - 70;
          const qrY = H - 100;
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.roundRect(qrX - 5, qrY - 5, 80, 80, 6);
          ctx.fill();
          ctx.drawImage(img, qrX, qrY, 70, 70);

          ctx.fillStyle = "#1a3a7a";
          ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("扫码报名", qrX + 35, qrY + 82);
          resolve();
        };
      });
    } catch {
      // QR code generation failed, continue without it
    }

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${props.destination}研学行程.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleCopyXiaohongshu = async () => {
    try {
      await navigator.clipboard.writeText(xiaohongshuContent);
      setCopiedType("xiaohongshu");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyLink = async () => {
    const link = `https://www.woaiyanxue.cn/itinerary?dest=${encodeURIComponent(props.destination)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedType("link");
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      // Fallback
    }
  };

  if (!props.visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={props.onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "20px 20px 0 0",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "85vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#1a3a7a" }}>
            📤 分享行程
          </h3>
          <button
            onClick={props.onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#999",
              padding: "4px",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
          <div
            ref={cardRef}
            style={{
              backgroundColor: "#faf8f4",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
            }}
          >
            <ItineraryShareCard
              destination={props.destination}
              days={props.days}
              grade={props.grade}
              content={props.content}
              budget={props.budget}
              intentionBase={props.intentionBase}
            />
            <p
              style={{
                textAlign: "center",
                color: "#666",
                fontSize: "13px",
                marginTop: "12px",
                marginBottom: 0,
              }}
            >
              长按图片可保存到相册
            </p>
          </div>

          {/* 联系人信息 */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
            <input
              type="text"
              placeholder="联系人姓名"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
            />
            <input
              type="tel"
              placeholder="联系电话"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              style={{ padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "14px", outline: "none" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={handleSaveImage}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 20px",
                backgroundColor: "#01c3a3",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              📱 保存行程卡片
            </button>

            <button
              onClick={handleCopyXiaohongshu}
              disabled={isGeneratingContent}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 20px",
                backgroundColor: isGeneratingContent ? "#e5e5e5" : "#fff",
                color: isGeneratingContent ? "#999" : "#1a3a7a",
                border: "2px solid #1a3a7a",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 500,
                cursor: isGeneratingContent ? "not-allowed" : "pointer",
              }}
            >
              {isGeneratingContent ? (
                "📝 正在生成文案..."
              ) : copiedType === "xiaohongshu" ? (
                "✅ 已复制！"
              ) : (
                "📋 复制小红书文案"
              )}
            </button>

            <button
              onClick={handleCopyLink}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "14px 20px",
                backgroundColor: "#fff",
                color: "#1a3a7a",
                border: "2px solid #1a3a7a",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {copiedType === "link" ? "✅ 已复制！" : "🔗 复制报名链接"}
            </button>
          </div>

          {xiaohongshuContent && !isGeneratingContent && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                backgroundColor: "#fff9f0",
                borderRadius: "12px",
                border: "1px solid #f0e6d3",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1a3a7a",
                }}
              >
                📝 小红书文案预览
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#4b5563",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.6,
                }}
              >
                {xiaohongshuContent}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function parseContentLines(content: string): string[] {
  const lines: string[] = [];
  const dayPattern = /【?第(\d+)天】?|第\s*(\d+)\s*天/;
  const contentLines = content.split("\n").map((l) => l.trim()).filter(Boolean);

  let currentDay = 0;
  contentLines.forEach((line) => {
    const dayMatch = line.match(dayPattern);
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1] || dayMatch[2], 10);
      const cleaned = line.replace(dayPattern, "").trim();
      if (cleaned) {
        lines.push(`第${currentDay}天：${cleaned}`);
      }
    } else if (line.length > 5 && currentDay > 0) {
      lines.push(`第${currentDay}天：${line}`);
    }
  });

  if (lines.length === 0 && content) {
    const sentences = content.split(/[。！？\n]/).filter((s) => s.trim().length > 0);
    sentences.slice(0, 10).forEach((s, i) => {
      if (s.trim()) {
        lines.push(`第${i + 1}天：${s.trim()}`);
      }
    });
  }

  return lines.slice(0, 20);
}