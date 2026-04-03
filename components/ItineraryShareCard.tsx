"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

export interface ItineraryShareCardProps {
  destination: string;
  days: string;
  grade: string;
  content: string;
  budget?: string;
  intentionBase?: string;
}

export async function generateItineraryCard(
  props: ItineraryShareCardProps
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const W = 540;
    const H = 675;
    canvas.width = W;
    canvas.height = H;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      resolve("");
      return;
    }

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

    const padding = 24;
    let y = 40;

    ctx.fillStyle = "#01c3a3";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const tagText = `📍 ${props.destination} ${props.days}天`;
    ctx.fillText(tagText, padding, y);

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
    ctx.textBaseline = "alphabetic";

    const lines = parseContentLines(props.content);
    const maxLines = 5;
    const displayLines = lines.slice(0, maxLines);

    displayLines.forEach((line) => {
      ctx.fillText(line, padding, y);
      y += 22;
    });

    if (lines.length > maxLines) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText(`...还有 ${lines.length - maxLines} 天行程`, padding, y);
      y += 18;
    }

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
    ctx.fillStyle = "#4b5563";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";

    if (props.budget) {
      ctx.fillText(`💰 费用：${props.budget}`, padding, y);
      y += 22;
    }

    ctx.fillText(`📅 适合：${props.grade}`, padding, y);

    const qrUrl = `https://www.woaiyanxue.cn/itinerary?dest=${encodeURIComponent(props.destination)}`;
    const qrSize = 70;
    const qrX = W - padding - qrSize;
    const qrY = H - qrSize - 30;

    QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 2,
      color: { dark: "#1a3a7a", light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        roundRectPath(ctx, qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 6);
        ctx.fill();
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        ctx.fillStyle = "#1a3a7a";
        ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("扫码报名", qrX + qrSize / 2, qrY + qrSize + 12);

        resolve(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    });
  });
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
    sentences.slice(0, 5).forEach((s, i) => {
      if (s.trim()) {
        lines.push(`第${i + 1}天：${s.trim()}`);
      }
    });
  }

  return lines.slice(0, 6);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export default function ItineraryShareCard(props: ItineraryShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 540;
    const H = 675;
    canvas.width = W;
    canvas.height = H;

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

    const padding = 24;
    let y = 40;

    ctx.fillStyle = "#01c3a3";
    ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    const tagText = `📍 ${props.destination} ${props.days}天`;
    ctx.fillText(tagText, padding, y);

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
    ctx.textBaseline = "alphabetic";

    const lines = parseContentLines(props.content);
    const maxLines = 5;
    const displayLines = lines.slice(0, maxLines);

    displayLines.forEach((line) => {
      ctx.fillText(line, padding, y);
      y += 22;
    });

    if (lines.length > maxLines) {
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText(`...还有 ${lines.length - maxLines} 天行程`, padding, y);
      y += 18;
    }

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
    ctx.fillStyle = "#4b5563";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";

    if (props.budget) {
      ctx.fillText(`💰 费用：${props.budget}`, padding, y);
      y += 22;
    }

    ctx.fillText(`📅 适合：${props.grade}`, padding, y);

    const qrUrl = `https://www.woaiyanxue.cn/itinerary?dest=${encodeURIComponent(props.destination)}`;
    const qrSize = 70;
    const qrX = W - padding - qrSize;
    const qrY = H - qrSize - 30;

    QRCode.toDataURL(qrUrl, {
      width: qrSize,
      margin: 2,
      color: { dark: "#1a3a7a", light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = "#ffffff";
        roundRectPath(ctx, qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 6);
        ctx.fill();
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        ctx.fillStyle = "#1a3a7a";
        ctx.font = "bold 10px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("扫码报名", qrX + qrSize / 2, qrY + qrSize + 12);

        if (imageRef.current) {
          imageRef.current.src = canvas.toDataURL("image/png");
        }
      };
      img.src = dataUrl;
    });
  }, [props]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img
        ref={imageRef}
        alt="行程分享卡片"
        style={{
          maxWidth: "100%",
          height: "auto",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />
    </div>
  );
}