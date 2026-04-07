"use client";

import { useRef, useEffect, useState } from "react";

export interface OrgPosterProps {
  orgName: string;
  orgType: string;
  location: string;
  targetAge: string;
  features: string;
  price?: string;
  contactName?: string;
  contactPhone?: string;
}

const WIDTH = 540;
const HEIGHT = 810;

const COLORS = {
  background: "#ffffff",
  gradientStart: "#01c3a3",
  gradientEnd: "#00a88a",
  primary: "#0a2463",
  accent: "#01c3a3",
  text: "#333333",
  lightText: "#666666",
  border: "#e5e7eb",
};

// 确保 Noto Sans SC 字体已加载（Canvas 2D 依赖浏览器 Fonts API）
async function ensureNotoSansSC() {
  try {
    const linkId = "noto-sans-sc-font";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 200));
  } catch (_) {}
}

function drawPoster(ctx: CanvasRenderingContext2D, props: OrgPosterProps) {
  const { orgName, orgType, location, targetAge, features, price, contactName, contactPhone } = props;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 顶部渐变条
  const topGradient = ctx.createLinearGradient(0, 0, 0, 70);
  topGradient.addColorStop(0, COLORS.gradientStart);
  topGradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, WIDTH, 70);

  // 主标题
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("机构招生宣传", WIDTH / 2, 28);

  // 机构名称
  let y = 90;
  ctx.fillStyle = COLORS.primary;
  ctx.font = "bold 26px 'Noto Sans SC', sans-serif";
  ctx.fillText(orgName || "机构名称", WIDTH / 2, y);

  // 机构类型+所在地
  y += 28;
  ctx.fillStyle = COLORS.lightText;
  ctx.font = "14px 'Noto Sans SC', sans-serif";
  ctx.fillText(`${orgType || "研学机构"} · ${location || "所在地"}`, WIDTH / 2, y);

  y += 20;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  // 课程介绍
  y += 25;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("课程介绍", 24, y);

  y += 28;
  ctx.fillStyle = COLORS.text;
  ctx.font = "14px 'Noto Sans SC', sans-serif";
  const featuresText = features || "机构特色和课程介绍";
  const maxWidth = WIDTH - 48;
  const lineHeight = 22;
  const words = featuresText.split("");
  let line = "";
  let lineY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, 24, lineY);
      line = words[i];
      lineY += lineHeight;
      if (lineY > y + lineHeight * 7) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 24, lineY);

  lineY += 20;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, lineY);
  ctx.lineTo(WIDTH - 20, lineY);
  ctx.stroke();

  // 适合人群
  lineY += 25;
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 15px 'Noto Sans SC', sans-serif";
  ctx.fillText(`适合人群：${targetAge || "待填写"}`, 24, lineY);

  // 参考价格
  lineY += 26;
  ctx.font = "bold 15px 'Noto Sans SC', sans-serif";
  ctx.fillText(`参考价格：${price || "请咨询"}`, 24, lineY);

  lineY += 20;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, lineY);
  ctx.lineTo(WIDTH - 20, lineY);
  ctx.stroke();

  // 联系方式
  lineY += 25;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'Noto Sans SC', sans-serif";
  ctx.fillText("联系我们", 24, lineY);

  lineY += 28;
  ctx.fillStyle = COLORS.text;
  ctx.font = "15px 'Noto Sans SC', sans-serif";
  if (contactName) {
    ctx.fillText("联系人：" + contactName, 24, lineY);
    lineY += 26;
  }
  if (contactPhone) {
    ctx.fillStyle = COLORS.primary;
    ctx.font = "bold 18px 'Noto Sans SC', sans-serif";
    ctx.fillText("📞 " + contactPhone, 24, lineY);
  }

  lineY += 28;
  ctx.fillStyle = COLORS.primary;
  ctx.font = "bold 18px 'Noto Sans SC', sans-serif";
  ctx.fillText("欢迎来电 / 来访洽谈合作！", 24, lineY);

  // 底部渐变条
  const bottomY = HEIGHT - 55;
  const bottomGradient = ctx.createLinearGradient(0, bottomY, 0, HEIGHT);
  bottomGradient.addColorStop(0, COLORS.gradientStart);
  bottomGradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, bottomY, WIDTH, 55);

  ctx.fillStyle = "#ffffff";
  ctx.font = "13px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("让孩子在体验中成长", WIDTH / 2, HEIGHT - 20);
}
export async function generateOrgPoster(props: OrgPosterProps): Promise<string> {
  await ensureNotoSansSC();
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    drawPoster(ctx, props);
  }
  return canvas.toDataURL("image/png");
}

export function OrgPosterCanvas(props: OrgPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      await ensureNotoSansSC();
      if (!mounted) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawPoster(ctx, props);
          setDataUrl(canvas.toDataURL("image/png"));
        }
      }
    })();
    return () => { mounted = false; };
  }, [props]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{
          width: "270px",
          height: "405px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      />
      {dataUrl && (
        <a
          href={dataUrl}
          download="org-poster.png"
          style={{
            padding: "12px 24px",
            background: "linear-gradient(135deg, #0a2463 0%, #1a3a7a 100%)",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
            fontWeight: 600,
            fontSize: "14px",
          }}
        >
          💾 保存海报
        </a>
      )}
    </div>
  );
}

export function OrgPosterModal({
  props,
  onClose,
}: {
  props: OrgPosterProps;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      await ensureNotoSansSC();
      if (!mounted) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          drawPoster(ctx, props);
          setDataUrl(canvas.toDataURL("image/png"));
        }
      }
    })();
    return () => { mounted = false; };
  }, [props]);

  const handleSave = () => {
    const link = document.createElement("a");
    link.download = "org-poster.png";
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "20px",
          maxWidth: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{
            width: "270px",
            height: "405px",
            borderRadius: "8px",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "20px",
        }}
      >
        <button
          onClick={handleSave}
          style={{
            padding: "14px 28px",
            background: "linear-gradient(135deg, #0a2463 0%, #1a3a7a 100%)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          💾 保存海报
        </button>
        <button
          onClick={onClose}
          style={{
            padding: "14px 28px",
            background: "white",
            color: "#0a2463",
            border: "1.5px solid #0a2463",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← 返回
        </button>
      </div>
    </div>
  );
}