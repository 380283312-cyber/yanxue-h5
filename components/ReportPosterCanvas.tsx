"use client";

import { useEffect, useRef } from "react";
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
  reportSummary?: string;
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
  reportSummary,
}: ReportPosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ─── Layout constants ───────────────────────────────────────────────
    const W = 600;
    const PADDING = 40;
    const QR_SIZE = 110;
    const CARD_R = 12;
    const LINE_H = 22;

    // Colors
    const GOLD = "#C9A84C";
    const DEEP_BLUE = "#1a2a4a";
    const DARK_BROWN = "#3d2b1f";
    const SOFT_TEAL = "#4A9E8B";
    const LIGHT_BG = "#faf8f4";

    // ─── Pre-compute layout ────────────────────────────────────────────
    // If reportSummary is provided, we need more vertical space
    const REPORT_CARD_H = 280;
    const QR_CARD_H = 210;
    const BOTTOM_BAND_H = 50;

    const TOP_AREA_H = 430; // header + student info + base/theme
    const REPORT_AREA_H = reportSummary ? REPORT_CARD_H + 20 : 0;
    const BOTTOM_AREA_H = QR_CARD_H + BOTTOM_BAND_H + 20;

    const totalH = TOP_AREA_H + REPORT_AREA_H + BOTTOM_AREA_H;

    // ─── Set canvas size FIRST ──────────────────────────────────────────
    canvas.width = W;
    canvas.height = totalH;

    // ─── Background: warm gradient ─────────────────────────────────────
    const bgGrad = ctx.createLinearGradient(0, 0, 0, totalH);
    bgGrad.addColorStop(0, "#faf6ee");
    bgGrad.addColorStop(0.4, "#f5f0e8");
    bgGrad.addColorStop(1, "#ede8df");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, totalH);

    // Subtle paper texture dots
    ctx.fillStyle = "rgba(160,140,100,0.06)";
    for (let i = 0; i < 80; i++) {
      const dx = (i * 137) % W;
      const dy = (i * 79) % totalH;
      ctx.beginPath();
      ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top band
    ctx.fillStyle = DEEP_BLUE;
    ctx.fillRect(0, 0, W, 8);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 8, W, 2);

    // ─── Helper: draw rounded rect ──────────────────────────────────────
    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      const c = ctx!;
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    }

    // ─── Top band: title ────────────────────────────────────────────────
    ctx.textAlign = "center";
    ctx.fillStyle = GOLD;
    ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("· 研学结业纪念 ·", W / 2, 46);

    ctx.strokeStyle = "rgba(201,168,76,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 90, 56);
    ctx.lineTo(W / 2 + 90, 56);
    ctx.stroke();

    ctx.fillStyle = DEEP_BLUE;
    ctx.font = "bold 46px -apple-system, BlinkMacSystemFont, 'STKaiti', 'KaiTi', serif";
    ctx.fillText("探索之旅", W / 2, 112);

    ctx.fillStyle = "#8a7a6a";
    ctx.font = "20px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学成长记录", W / 2, 148);

    if (date) {
      ctx.fillStyle = "#bbb";
      ctx.font = "13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText(date, W / 2, 180);
    }

    // ─── Student info ───────────────────────────────────────────────────
    const infoY = 210;
    ctx.textAlign = "center";

    ctx.fillStyle = DARK_BROWN;
    ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'STKaiti', serif";
    ctx.fillText(studentName || "同学", W / 2, infoY + 40);

    // Gold dot separator
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(W / 2, infoY + 56, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6b5a4a";
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    const schoolText = [school, grade].filter(Boolean).join(" · ");
    ctx.fillText(schoolText || "—", W / 2, infoY + 84);

    // Gold dashed line
    ctx.strokeStyle = "rgba(201,168,76,0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(70, infoY + 108);
    ctx.lineTo(W - 70, infoY + 108);
    ctx.stroke();
    ctx.setLineDash([]);

    // ─── Base & Theme ──────────────────────────────────────────────────
    const baseY = infoY + 120;
    ctx.textAlign = "center";

    ctx.fillStyle = GOLD;
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学基地", W / 2, baseY);

    ctx.fillStyle = DEEP_BLUE;
    ctx.font = "bold 26px -apple-system, BlinkMacSystemFont, 'STKaiti', serif";
    ctx.fillText(base || "—", W / 2, baseY + 32);

    ctx.fillStyle = "rgba(61,43,31,0.5)";
    ctx.font = "13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学主题", W / 2, baseY + 60);

    ctx.fillStyle = DARK_BROWN;
    ctx.font = "18px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    const themeDisplay = theme.length > 35 ? theme.substring(0, 35) + "…" : (theme || "—");
    ctx.fillText(themeDisplay, W / 2, baseY + 84);

    // ─── Report summary card ────────────────────────────────────────────
    let contentY = baseY + 100;

    if (reportSummary) {
      const cardX = 30;
      const cardW = W - 60;
      const cardH = REPORT_CARD_H;

      // Shadow
      ctx.fillStyle = "rgba(0,0,0,0.06)";
      roundRect(cardX + 3, contentY + 3, cardW, cardH, CARD_R);
      ctx.fill();

      // Card background
      ctx.fillStyle = LIGHT_BG;
      roundRect(cardX, contentY, cardW, cardH, CARD_R);
      ctx.fill();

      // Gold top border
      ctx.fillStyle = GOLD;
      roundRect(cardX, contentY, cardW, 3, CARD_R);
      ctx.fill();

      // Section label
      ctx.textAlign = "left";
      ctx.fillStyle = GOLD;
      ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText("研学记录摘要", cardX + 16, contentY + 22);

      // Separator
      ctx.strokeStyle = "rgba(201,168,76,0.25)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(cardX + 16, contentY + 30);
      ctx.lineTo(cardX + cardW - 16, contentY + 30);
      ctx.stroke();

      // Report text
      ctx.fillStyle = "#4a3a2a";
      ctx.font = "13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      const textMaxW = cardW - 32;
      const truncatedSummary = reportSummary.length > 350
        ? reportSummary.substring(0, 350) + "…"
        : reportSummary;

      // Word-wrap
      const chars = Math.floor(textMaxW / 13);
      const paragraphs = truncatedSummary.split("\n");
      let cy = contentY + 48;
      for (const para of paragraphs) {
        if (para.trim() === "") { cy += 6; continue; }
        const words = para.split(/([\s\u200b]+)/);
        let row = "";
        for (const w of words) {
          if ((row + w).length > chars) {
            ctx.fillText(row.trim(), cardX + 16, cy);
            cy += LINE_H;
            row = w;
          } else {
            row += w;
          }
        }
        if (row.trim()) { ctx.fillText(row.trim(), cardX + 16, cy); cy += LINE_H; }
      }

      contentY += cardH + 20;
    }

    // ─── QR card ───────────────────────────────────────────────────────
    const qrCardX = 50;
    const qrCardW = W - 100;
    const qrCardY = contentY;
    const qrCardH = QR_CARD_H;

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    roundRect(qrCardX + 3, qrCardY + 3, qrCardW, qrCardH, 14);
    ctx.fill();

    // Card
    ctx.fillStyle = "#ffffff";
    roundRect(qrCardX, qrCardY, qrCardW, qrCardH, 14);
    ctx.fill();

    // Gold top
    ctx.fillStyle = GOLD;
    roundRect(qrCardX, qrCardY, qrCardW, 4, 14);
    ctx.fill();

    const qrX = qrCardX + (qrCardW - QR_SIZE) / 2;
    const qrY = qrCardY + 18;

    // QR code drawn after async load
    QRCode.toDataURL(url, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: DEEP_BLUE, light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qrX, qrY, QR_SIZE, QR_SIZE);

        // QR corner decorations
        ctx.strokeStyle = SOFT_TEAL;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        const cs = 9;
        // TL
        ctx.beginPath(); ctx.moveTo(qrX, qrY + cs); ctx.lineTo(qrX, qrY); ctx.lineTo(qrX + cs, qrY); ctx.stroke();
        // TR
        ctx.beginPath(); ctx.moveTo(qrX + QR_SIZE - cs, qrY); ctx.lineTo(qrX + QR_SIZE, qrY); ctx.lineTo(qrX + QR_SIZE, qrY + cs); ctx.stroke();
        // BL
        ctx.beginPath(); ctx.moveTo(qrX, qrY + QR_SIZE - cs); ctx.lineTo(qrX, qrY + QR_SIZE); ctx.lineTo(qrX + cs, qrY + QR_SIZE); ctx.stroke();
        // BR
        ctx.beginPath(); ctx.moveTo(qrX + QR_SIZE - cs, qrY + QR_SIZE); ctx.lineTo(qrX + QR_SIZE, qrY + QR_SIZE); ctx.lineTo(qrX + QR_SIZE, qrY + QR_SIZE - cs); ctx.stroke();

        // Text below QR
        ctx.fillStyle = DARK_BROWN;
        ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("长按识别二维码", W / 2, qrY + QR_SIZE + 22);

        ctx.fillStyle = SOFT_TEAL;
        ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("免费生成你的研学报告", W / 2, qrY + QR_SIZE + 40);

        ctx.fillStyle = DEEP_BLUE;
        ctx.font = "bold 13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("www.woaiyanxue.cn", W / 2, qrY + QR_SIZE + 58);

        // ─── Bottom slogan band ─────────────────────────────────────────
        const bottomY = qrCardY + qrCardH + 16;
        ctx.fillStyle = DEEP_BLUE;
        roundRect(35, bottomY, W - 70, BOTTOM_BAND_H - 6, 10);
        ctx.fill();

        ctx.fillStyle = GOLD;
        ctx.font = "bold 15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("让每一次探索，都留下成长印记", W / 2, bottomY + (BOTTOM_BAND_H - 6) / 2 + 5);

        // Bottom gold line
        ctx.fillStyle = GOLD;
        ctx.fillRect(0, totalH - 3, W, 3);

        // ─── Trigger download ───────────────────────────────────────────
        triggerDownload(canvas);
      };
      img.src = dataUrl;
    });
  }, [url, studentName, school, grade, base, theme, date, bgType, reportSummary]);

  return <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />;
}

function triggerDownload(canvas: HTMLCanvasElement) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "研学结业纪念卡.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
