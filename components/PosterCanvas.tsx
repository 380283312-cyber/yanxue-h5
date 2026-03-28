"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";

interface PosterCanvasProps {
  url: string;
}

export default function PosterCanvas({ url }: PosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 600;
    const H = 820;
    canvas.width = W;
    canvas.height = H;

    // ── Background gradient ──────────────────────────────────────
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#01C3A3");
    bg.addColorStop(0.5, "#01879A");
    bg.addColorStop(1, "#1a1a2e");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // ── Decorative circles ─────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.beginPath();
    ctx.arc(520, 60, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(80, 180, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(480, 280, 40, 0, Math.PI * 2);
    ctx.fill();

    // ── White card (top) ────────────────────────────────────────
    roundRect(ctx, 30, 60, 540, 180, 20);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    // ── Logo circle ─────────────────────────────────────────────
    ctx.fillStyle = "#01C3A3";
    ctx.beginPath();
    ctx.arc(100, 150, 36, 0, Math.PI * 2);
    ctx.fill();

    // Logo emoji
    ctx.fillStyle = "#01C3A3";
    ctx.fillStyle = "white";
    ctx.font = "bold 36px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🎓", 100, 152);

    // Title
    ctx.fillStyle = "#1a1a2e";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("研学顾问小智", 155, 135);

    // Subtitle
    ctx.fillStyle = "#666666";
    ctx.font = "18px Arial";
    ctx.fillText("AI 智能研学助手", 155, 165);

    // Tagline lines
    ctx.fillStyle = "#444444";
    ctx.font = "16px Arial";
    ctx.fillText("输入目的地，AI 帮你生成完整研学方案", 30, 215);
    ctx.fillText("报告生成 · 行程规划 · 专业咨询", 30, 238);

    // ── Feature cards ────────────────────────────────────────────
    const features = [
      { emoji: "🗺️", label: "行程规划", sub: "AI 个性化推荐", x: 30 },
      { emoji: "📝", label: "报告生成", sub: "一键导出存档", x: 217 },
      { emoji: "💬", label: "专业咨询", sub: "24h 在线", x: 405 },
    ];

    features.forEach(({ emoji, label, sub, x }) => {
      roundRect(ctx, x, 270, 165, 90, 14);
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill();
      ctx.font = "28px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(emoji, x + 82, 300);
      ctx.font = "13px Arial";
      ctx.fillStyle = "#555";
      ctx.fillText(label, x + 82, 328);
      ctx.font = "11px Arial";
      ctx.fillStyle = "#999";
      ctx.fillText(sub, x + 82, 348);
    });

    // ── QR Code card ─────────────────────────────────────────────
    roundRect(ctx, 30, 390, 540, 340, 24);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    // Generate and draw QR code
    QRCode.toDataURL(url, {
      width: 280,
      margin: 2,
      color: { dark: "#1a1a2e", light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 160, 415, 280, 280);

        // Bottom text
        ctx.fillStyle = "#1a1a2e";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("长按识别二维码", 300, 740);
        ctx.fillStyle = "#888888";
        ctx.font = "14px Arial";
        ctx.fillText("立即体验 AI 研学之旅", 300, 765);

        // URL bar
        roundRect(ctx, 30, 785, 540, 30, 8);
        ctx.fillStyle = "#f0f9f7";
        ctx.fill();
        ctx.fillStyle = "#01C3A3";
        ctx.font = "13px Arial";
        ctx.fillText("www.woaiyanxue.cn", 300, 805);

        // Trigger download
        triggerDownload(canvas);
      };
      img.src = dataUrl;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "none" }}
      aria-hidden="true"
    />
  );
}

function triggerDownload(canvas: HTMLCanvasElement) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "研学AI助手-分享海报.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function roundRect(
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
