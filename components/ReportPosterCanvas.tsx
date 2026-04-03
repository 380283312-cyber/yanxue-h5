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
  /**  图片生成完毕后回调，传入 dataURL */
  onDataUrlReady?: (dataUrl: string) => void;
}

const W = 600;
const GOLD = "#C9A84C";
const DEEP_BLUE = "#1a2a4a";
const DARK_BROWN = "#3d2b1f";
const SOFT_TEAL = "#4A9E8B";
const LIGHT_BG = "#faf8f4";
const LINE_H = 22;
const CARD_X = 30;
const CARD_W = W - CARD_X * 2;

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
  onDataUrlReady,
}: ReportPosterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // ─── Draw rounded rect ──────────────────────────────────────────
    function rr(x: number, y: number, w: number, h: number, r: number) {
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

    // ─── Wrap Chinese text into lines ──────────────────────────────
    function wrap(text: string, maxChars: number): string[] {
      const out: string[] = [];
      const paras = text.split("\n");
      for (const p of paras) {
        if (!p.trim()) { out.push(""); continue; }
        const s = p.replace(/\s+/g, " ").trim();
        let i = 0;
        while (i < s.length) {
          out.push(s.slice(i, i + maxChars));
          i += maxChars;
        }
      }
      return out;
    }

    // ─── Build summary (max 8 lines) ───────────────────────────────
    const SUMMARY_HEAD_H = 40;
    const SUMMARY_MAX_LINES = 30;
    const INNER_PAD = 20;
    const availW = CARD_W - INNER_PAD * 2;
    // Use 13px Chinese font: each char ≈ 13px wide, leave breathing room
    const CHARS_PER_LINE = Math.floor(availW / 14);
    const summaryLines = reportSummary ? wrap(reportSummary, CHARS_PER_LINE) : [];
    const clippedLines = summaryLines.slice(0, SUMMARY_MAX_LINES);
    const summaryBlockH = clippedLines.length * LINE_H + (clippedLines.length > 1 ? (clippedLines.length - 1) * 4 : 0);
    const SUMMARY_CARD_H = SUMMARY_HEAD_H + summaryBlockH + INNER_PAD;

    // ─── Layout heights ──────────────────────────────────────────────
    const TOP_H = 200;
    const INFO_H = 115;
    const BASE_H = 120;
    const SUMMARY_H = reportSummary ? SUMMARY_CARD_H + 15 : 0;
    const QR_H = 200;
    const BAND_H = 48;
    const GAP = 20;

    const totalH =
      TOP_H + INFO_H + BASE_H + SUMMARY_H +
      QR_H + BAND_H + GAP + 20;

    canvas.width = W;
    canvas.height = totalH;

    // ─── Background ─────────────────────────────────────────────────
    const g = ctx.createLinearGradient(0, 0, 0, totalH);
    g.addColorStop(0, "#faf6ee");
    g.addColorStop(0.5, "#f5f0e8");
    g.addColorStop(1, "#ede8df");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, totalH);

    // Texture dots
    ctx.fillStyle = "rgba(160,140,100,0.05)";
    for (let i = 0; i < 60; i++) {
      ctx.beginPath();
      ctx.arc((i * 137) % W, (i * 79) % totalH, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Top bands
    ctx.fillStyle = DEEP_BLUE;
    ctx.fillRect(0, 0, W, 6);
    ctx.fillStyle = GOLD;
    ctx.fillRect(0, 6, W, 2);

    // ─── Title ──────────────────────────────────────────────────────
    let y = 42;
    ctx.textAlign = "center";
    ctx.fillStyle = GOLD;
    ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("· 研学结业纪念 ·", W / 2, y);

    ctx.strokeStyle = "rgba(201,168,76,0.35)";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 80, y + 10);
    ctx.lineTo(W / 2 + 80, y + 10);
    ctx.stroke();

    y += 42;
    ctx.fillStyle = DEEP_BLUE;
    ctx.font = "bold 40px -apple-system, BlinkMacSystemFont, 'STKaiti', serif";
    ctx.fillText("探索之旅", W / 2, y);

    y += 28;
    ctx.fillStyle = "#8a7a6a";
    ctx.font = "18px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学成长记录", W / 2, y);

    if (date) {
      y += 22;
      ctx.fillStyle = "#bbb";
      ctx.font = "12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText(date, W / 2, y);
    }

    // ─── Student info ───────────────────────────────────────────────
    y = TOP_H;
    ctx.textAlign = "center";

    // Name: 30px (reduced from 40px)
    ctx.fillStyle = DARK_BROWN;
    ctx.font = "bold 30px -apple-system, BlinkMacSystemFont, 'STKaiti', serif";
    ctx.fillText(studentName || "同学", W / 2, y + 34);

    // Gold dot
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(W / 2, y + 48, 3.5, 0, Math.PI * 2);
    ctx.fill();

    y += 66;
    ctx.fillStyle = "#6b5a4a";
    ctx.font = "15px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText([school, grade].filter(Boolean).join("  ·  ") || "—", W / 2, y);

    // Separator
    y += 18;
    ctx.strokeStyle = "rgba(201,168,76,0.3)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();
    ctx.setLineDash([]);

    // ─── Base & theme ───────────────────────────────────────────────
    y += 26;
    ctx.textAlign = "center";
    ctx.fillStyle = GOLD;
    ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学基地", W / 2, y);

    y += 22;
    ctx.fillStyle = DEEP_BLUE;
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'STKaiti', serif";
    ctx.fillText(base || "—", W / 2, y);

    y += 26;
    ctx.fillStyle = "rgba(61,43,31,0.5)";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText("研学主题", W / 2, y);

    y += 20;
    ctx.fillStyle = DARK_BROWN;
    ctx.font = "16px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
    ctx.fillText(theme.length > 32 ? theme.slice(0, 32) + "…" : (theme || "—"), W / 2, y);

    // ─── Summary card ───────────────────────────────────────────────
    if (reportSummary) {
      y += 20;
      const cH = SUMMARY_CARD_H;

      ctx.fillStyle = "rgba(0,0,0,0.05)";
      rr(CARD_X + 2, y + 2, CARD_W, cH, 12);
      ctx.fill();

      ctx.fillStyle = LIGHT_BG;
      rr(CARD_X, y, CARD_W, cH, 12);
      ctx.fill();

      ctx.fillStyle = GOLD;
      rr(CARD_X, y, CARD_W, 3, 12);
      ctx.fill();

      // Label
      ctx.textAlign = "left";
      ctx.fillStyle = GOLD;
      ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      ctx.fillText("研学记录摘要", CARD_X + 16, y + 20);

      // Separator
      ctx.strokeStyle = "rgba(201,168,76,0.2)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(CARD_X + 16, y + 28);
      ctx.lineTo(CARD_X + CARD_W - 16, y + 28);
      ctx.stroke();

      // Text lines
      ctx.fillStyle = "#4a3a2a";
      ctx.font = "13px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
      let ty = y + 46;
      for (let i = 0; i < clippedLines.length; i++) {
        ctx.fillText(clippedLines[i], CARD_X + 16, ty);
        ty += LINE_H;
        if (i < clippedLines.length - 1) ty += 4;
      }

      // Truncation hint
      if (summaryLines.length > SUMMARY_MAX_LINES) {
        ctx.fillStyle = "rgba(74,58,42,0.35)";
        ctx.font = "12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("…", CARD_X + 16, ty + 4);
      }

      y += cH + 15;
    } else {
      y += 20;
    }

    // ─── QR card ───────────────────────────────────────────────────
    const qx = 50;
    const qw = W - 100;
    const qSize = 95;
    const qLeft = qx + (qw - qSize) / 2;

    ctx.fillStyle = "rgba(0,0,0,0.05)";
    rr(qx + 2, y + 2, qw, QR_H, 14);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    rr(qx, y, qw, QR_H, 14);
    ctx.fill();

    ctx.fillStyle = GOLD;
    rr(qx, y, qw, 4, 14);
    ctx.fill();

    // ─── Async QR code ───────────────────────────────────────────────
    QRCode.toDataURL(url, {
      width: qSize,
      margin: 2,
      color: { dark: DEEP_BLUE, light: "#ffffff" },
    }).then((dataUrl) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, qLeft, y + 16, qSize, qSize);

        // QR corner brackets
        ctx.strokeStyle = SOFT_TEAL;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        const cs = 8;
        const qx2 = qLeft, qy2 = y + 16, qs = qSize;
        ctx.beginPath(); ctx.moveTo(qx2, qy2 + cs); ctx.lineTo(qx2, qy2); ctx.lineTo(qx2 + cs, qy2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(qx2 + qs - cs, qy2); ctx.lineTo(qx2 + qs, qy2); ctx.lineTo(qx2 + qs, qy2 + cs); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(qx2, qy2 + qs - cs); ctx.lineTo(qx2, qy2 + qs); ctx.lineTo(qx2 + cs, qy2 + qs); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(qx2 + qs - cs, qy2 + qs); ctx.lineTo(qx2 + qs, qy2 + qs); ctx.lineTo(qx2 + qs, qy2 + qs - cs); ctx.stroke();

        // Below QR
        ctx.textAlign = "center";
        ctx.fillStyle = DARK_BROWN;
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("长按识别二维码", W / 2, y + 16 + qSize + 20);

        ctx.fillStyle = SOFT_TEAL;
        ctx.font = "bold 11px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("免费生成你的研学报告", W / 2, y + 16 + qSize + 38);

        ctx.fillStyle = DEEP_BLUE;
        ctx.font = "bold 12px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("www.woaiyanxue.cn", W / 2, y + 16 + qSize + 56);

        // Bottom band
        const bY = y + QR_H + GAP;
        ctx.fillStyle = DEEP_BLUE;
        rr(35, bY, W - 70, BAND_H, 10);
        ctx.fill();

        ctx.fillStyle = GOLD;
        ctx.font = "bold 14px -apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif";
        ctx.fillText("让每一次探索，都留下成长印记", W / 2, bY + BAND_H / 2 + 5);

        // Bottom gold line
        ctx.fillStyle = GOLD;
        ctx.fillRect(0, totalH - 3, W, 3);

        // Expose dataURL
        if (onDataUrlReady) onDataUrlReady(canvas.toDataURL("image/png"));
      };
      img.src = dataUrl;
    }).catch((err) => {
      console.error("QRCode failed:", err);
    });
  }, [url, studentName, school, grade, base, theme, date, bgType, reportSummary, onDataUrlReady]);

  return <canvas ref={canvasRef} style={{ display: "none" }} aria-hidden="true" />;
}
