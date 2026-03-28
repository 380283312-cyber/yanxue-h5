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
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    // ── Solid dark background ──────────────────────────────────────
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, W, H);

    // ── Top teal accent bar ───────────────────────────────────────
    ctx.fillStyle = "#01C3A3";
    ctx.fillRect(0, 0, W, 6);

    // ── Decorative circle (top right, subtle) ─────────────────────
    const radial = ctx.createRadialGradient(W - 80, 120, 10, W - 80, 120, 200);
    radial.addColorStop(0, "rgba(1,195,163,0.15)");
    radial.addColorStop(1, "rgba(1,195,163,0)");
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(W - 80, 120, 200, 0, Math.PI * 2);
    ctx.fill();

    // ── Logo circle ─────────────────────────────────────────────
    const logoX = 60;
    const logoY = 120;
    const logoR = 40;

    ctx.fillStyle = "#01C3A3";
    ctx.beginPath();
    ctx.arc(logoX, logoY, logoR, 0, Math.PI * 2);
    ctx.fill();

    // Graduation cap - drawn with paths (no emoji)
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    // Cap body
    ctx.beginPath();
    ctx.moveTo(logoX - 18, logoY - 2);
    ctx.lineTo(logoX, logoY - 12);
    ctx.lineTo(logoX + 18, logoY - 2);
    ctx.stroke();
    // Cap base
    ctx.beginPath();
    ctx.moveTo(logoX - 22, logoY);
    ctx.lineTo(logoX + 22, logoY);
    ctx.stroke();
    // Tassel
    ctx.beginPath();
    ctx.moveTo(logoX, logoY - 12);
    ctx.lineTo(logoX + 16, logoY + 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(logoX + 16, logoY + 10);
    ctx.lineTo(logoX + 22, logoY + 6);
    ctx.stroke();

    // ── Title ─────────────────────────────────────────────────────
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 38px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("研学顾问小智", logoX + logoR + 20, logoY + 14);

    // ── Subtitle ──────────────────────────────────────────────────
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.font = "20px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("AI 智能研学助手", logoX + logoR + 20, logoY + 44);

    // ── Divider line ───────────────────────────────────────────────
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 210);
    ctx.lineTo(W - 40, 210);
    ctx.stroke();

    // ── Feature tags ──────────────────────────────────────────────
    const tags = ["行程规划", "报告生成", "专业咨询"];
    const tagX = 40;
    const tagY = 255;
    const tagGap = 140;

    ctx.font = "15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.textAlign = "center";
    tags.forEach((tag, i) => {
      const tx = tagX + i * tagGap;
      // Tag pill background
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      roundRectPath(ctx, tx, tagY, 120, 36, 18);
      ctx.fill();
      // Tag text
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.textBaseline = "middle";
      ctx.fillText(tag, tx + 60, tagY + 18);
    });

    // ── QR code card ───────────────────────────────────────────────
    const cardX = 40;
    const cardY = 330;
    const cardW = W - 80;
    const cardH = cardW + 60; // slightly taller for text below QR

    // Card background
    ctx.fillStyle = "#ffffff";
    roundRectPath(ctx, cardX, cardY, cardW, cardH, 20);
    ctx.fill();

    // QR code zone
    const qrSize = cardW - 60;
    const qrX = cardX + 30;
    const qrY = cardY + 30;

    // Generate QR and draw
    QRCode.toDataURL(url, {
      width: qrSize,
      margin: 3,
      color: { dark: "#0f172a", light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // Scan line animation hint (decorative corner marks)
        const cornerSize = 16;
        ctx.strokeStyle = "#01C3A3";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        // TL
        ctx.beginPath();
        ctx.moveTo(qrX, qrY + cornerSize);
        ctx.lineTo(qrX, qrY);
        ctx.lineTo(qrX + cornerSize, qrY);
        ctx.stroke();
        // TR
        ctx.beginPath();
        ctx.moveTo(qrX + qrSize - cornerSize, qrY);
        ctx.lineTo(qrX + qrSize, qrY);
        ctx.lineTo(qrX + qrSize, qrY + cornerSize);
        ctx.stroke();
        // BL
        ctx.beginPath();
        ctx.moveTo(qrX, qrY + qrSize - cornerSize);
        ctx.lineTo(qrX, qrY + qrSize);
        ctx.lineTo(qrX + cornerSize, qrY + qrSize);
        ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(qrX + qrSize - cornerSize, qrY + qrSize);
        ctx.lineTo(qrX + qrSize, qrY + qrSize);
        ctx.lineTo(qrX + qrSize, qrY + qrSize - cornerSize);
        ctx.stroke();

        // Bottom text in card
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillText("长按识别二维码", W / 2, qrY + qrSize + 38);

        ctx.fillStyle = "#94a3b8";
        ctx.font = "15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("立即体验 AI 研学之旅", W / 2, qrY + qrSize + 62);

        // ── Bottom URL bar ──────────────────────────────────────────
        ctx.fillStyle = "#1e293b";
        roundRectPath(ctx, 40, cardY + cardH + 24, cardW, 44, 12);
        ctx.fill();

        ctx.fillStyle = "#01C3A3";
        ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("www.woaiyanxue.cn", W / 2, cardY + cardH + 46);

        // ── Trigger download ─────────────────────────────────────────
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
