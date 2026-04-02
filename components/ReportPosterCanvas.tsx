"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface ReportPosterCanvasProps {
  url: string;
  studentName: string;
  school: string;
  grade: string;
  base: string;
  theme: string;
  date: string;
  bgType?: "palace" | "mountain";
}

export default function ReportPosterCanvas({
  url,
  studentName,
  school,
  grade,
  base,
  theme,
  date,
  bgType = "palace",
}: ReportPosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImg, setBgImg] = useState<HTMLImageElement | null>(null);

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = bgType === "palace" ? "/bg-palace.jpg" : "/bg-yellow-mountain.jpg";
    img.onload = () => setBgImg(img);
  }, [bgType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = 600;
    const H = 900;
    canvas.width = W;
    canvas.height = H;

    // ─── Color palette ───────────────────────────────────────────────
    const GOLD = "#C9A84C";
    const DEEP_BLUE = "#1a2a4a";
    const DARK_BROWN = "#3d2b1f";
    const SOFT_TEAL = "#4A9E8E";

    // ─── Background ────────────────────────────────────────────────
    if (bgImg) {
      // Draw background image with cover mode (center crop)
      const imgAspect = bgImg.width / bgImg.height;
      const canvasAspect = W / H;
      let drawW, drawH, drawX, drawY;
      if (imgAspect > canvasAspect) {
        drawH = H;
        drawW = H * imgAspect;
        drawX = (W - drawW) / 2;
        drawY = 0;
      } else {
        drawW = W;
        drawH = W / imgAspect;
        drawX = 0;
        drawY = (H - drawH) / 2;
      }
      ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);

      // Dark gradient overlay — top band area darker for title readability
      const topGrad = ctx.createLinearGradient(0, 0, 0, 280);
      topGrad.addColorStop(0, "rgba(10,15,30,0.75)");
      topGrad.addColorStop(1, "rgba(10,15,30,0.2)");
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, 280);

      // Bottom overlay for bottom card readability
      const bottomGrad = ctx.createLinearGradient(0, H - 300, 0, H);
      bottomGrad.addColorStop(0, "rgba(10,15,30,0)");
      bottomGrad.addColorStop(1, "rgba(10,15,30,0.6)");
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, H - 300, W, 300);

      // Subtle center vignette
      const centerGrad = ctx.createRadialGradient(W/2, H/2, 80, W/2, H/2, 500);
      centerGrad.addColorStop(0, "rgba(10,15,30,0.1)");
      centerGrad.addColorStop(1, "rgba(10,15,30,0)");
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // Fallback gradient background
      ctx.fillStyle = "#1a2a4a";
      ctx.fillRect(0, 0, W, H);
    }

    // Gold accent line
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 220, W, 3);

    // ─── Top band content ───────────────────────────────────────────
    ctx.textAlign = "center";

    // "研学结业纪念" label
    ctx.fillStyle = GOLD;
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.letterSpacing = "6px";
    ctx.fillText("· 研学结业纪念 ·", W / 2, 52);

    // Decorative line
    ctx.strokeStyle = "rgba(201,168,76,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2 - 100, 62);
    ctx.lineTo(W/2 + 100, 62);
    ctx.stroke();

    // Main title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 48px -apple-system, BlinkMacSystemFont, 'PingFang SC', 'STKaiti', serif";
    ctx.fillText("探索之旅", W / 2, 118);

    // Subtitle
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.font = "22px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学成长记录", W / 2, 155);

    // Date in band
    if (date) {
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText(date, W / 2, 192);
    }

    // ─── Student info section ──────────────────────────────────────
    const infoY = 280 + 40;

    // Student name - large elegant
    ctx.fillStyle = DARK_BROWN;
    ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'STKaiti', 'KaiTi', serif";
    ctx.textAlign = "center";
    ctx.fillText(studentName || "同学", W / 2, infoY + 50);

    // Decorative dot separator
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(W/2, infoY + 68, 4, 0, Math.PI * 2);
    ctx.fill();

    // School & grade
    ctx.fillStyle = "#6b5a4a";
    ctx.font = "18px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    const schoolText = [school, grade].filter(Boolean).join(" · ");
    ctx.fillText(schoolText || "—", W / 2, infoY + 100);

    // ─── Divider ───────────────────────────────────────────────────
    ctx.strokeStyle = "rgba(201,168,76,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(80, infoY + 130);
    ctx.lineTo(W - 80, infoY + 130);
    ctx.stroke();
    ctx.setLineDash([]);

    // ─── Base / Theme section ──────────────────────────────────────
    const baseY = infoY + 165;

    // Base label
    ctx.fillStyle = GOLD;
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学基地", W / 2, baseY);

    // Base name
    ctx.fillStyle = DEEP_BLUE;
    ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, 'STKaiti', 'KaiTi', serif";
    ctx.fillText(base || "—", W / 2, baseY + 38);

    // Theme label
    ctx.fillStyle = "rgba(61,43,31,0.6)";
    ctx.font = "15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学主题", W / 2, baseY + 72);

    // Theme text
    ctx.fillStyle = DARK_BROWN;
    ctx.font = "20px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    const themeDisplay = theme.length > 20 ? theme.substring(0, 20) + "…" : theme;
    ctx.fillText(themeDisplay || "—", W / 2, baseY + 100);

    // ─── Bottom card with QR ────────────────────────────────────────
    const cardX = 60;
    const cardW = W - 120;
    const cardY = baseY + 135;
    const cardH = 230;

    // Card shadow (pseudo)
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    roundRect(ctx, cardX + 4, cardY + 4, cardW, cardH, 16);
    ctx.fill();

    // Card background
    ctx.fillStyle = "#ffffff";
    roundRect(ctx, cardX, cardY, cardW, cardH, 16);
    ctx.fill();

    // Gold top border on card
    ctx.fillStyle = GOLD;
    roundRect(ctx, cardX, cardY, cardW, 4, 16);
    ctx.fill();
    ctx.fillStyle = "rgba(201,168,76,0.3)";
    ctx.fillRect(cardX, cardY + 4, cardW, 1);

    // QR area
    const qrSize = 130;
    const qrX = cardX + (cardW - qrSize) / 2;
    const qrY = cardY + 22;

    QRCode.toDataURL(url, {
      width: qrSize,
      margin: 2,
      color: { dark: DEEP_BLUE, light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);

        // QR corner decorations
        ctx.strokeStyle = SOFT_TEAL;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        const cs = 10;
        // TL
        ctx.beginPath();
        ctx.moveTo(qrX, qrY + cs);
        ctx.lineTo(qrX, qrY);
        ctx.lineTo(qrX + cs, qrY);
        ctx.stroke();
        // TR
        ctx.beginPath();
        ctx.moveTo(qrX + qrSize - cs, qrY);
        ctx.lineTo(qrX + qrSize, qrY);
        ctx.lineTo(qrX + qrSize, qrY + cs);
        ctx.stroke();
        // BL
        ctx.beginPath();
        ctx.moveTo(qrX, qrY + qrSize - cs);
        ctx.lineTo(qrX, qrY + qrSize);
        ctx.lineTo(qrX + cs, qrY + qrSize);
        ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(qrX + qrSize - cs, qrY + qrSize);
        ctx.lineTo(qrX + qrSize, qrY + qrSize);
        ctx.lineTo(qrX + qrSize, qrY + qrSize - cs);
        ctx.stroke();

        // Scan instruction
        ctx.fillStyle = DARK_BROWN;
        ctx.font = "bold 17px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("长按识别二维码", W / 2, qrY + qrSize + 26);

        // CTA text
        ctx.fillStyle = SOFT_TEAL;
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("免费生成你的研学报告", W / 2, qrY + qrSize + 50);

        // Bottom URL
        ctx.fillStyle = "#1a2a4a";
        ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("🎓 www.woaiyanxue.cn", W / 2, qrY + qrSize + 72);

        // Bottom band
        const bottomY = cardY + cardH + 20;
        const bottomBandH = 44;
        ctx.fillStyle = DEEP_BLUE;
        roundRect(ctx, 40, bottomY, W - 80, bottomBandH, 12);
        ctx.fill();

        ctx.fillStyle = GOLD;
        ctx.font = "bold 16px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("让每一次探索，都留下成长印记", W / 2, bottomY + 28);

        // Bottom decorative line
        ctx.fillStyle = "rgba(201,168,76,0.3)";
        ctx.fillRect(0, H - 4, W, 4);

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
  a.download = "研学结业纪念卡.png";
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

function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  color: string,
  corner: "TL" | "TR" | "BL" | "BR"
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.6;

  const x1 = corner === "TL" || corner === "BL" ? cx - w : cx;
  const x2 = corner === "TL" || corner === "BL" ? cx : cx + w;
  const y1 = corner === "TL" || corner === "TR" ? cy - h : cy;
  const y2 = corner === "TL" || corner === "TR" ? cy : cy + h;

  // L-shape corner
  ctx.beginPath();
  ctx.moveTo(x1, y1 + h * 0.4);
  ctx.lineTo(x1, y1);
  ctx.lineTo(x1 + w * 0.4, y1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x2 - w * 0.4, y2);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2, y2 + h * 0.4);
  ctx.stroke();

  ctx.globalAlpha = 1;
}
