"use client";

import { useRef, useEffect, useState } from "react";

export interface SchoolPosterProps {
  schoolName: string;
  theme: string;
  date: string;
  location: string;
  grade: string;
  highlights: string[];
  contactName?: string;
  contactPhone?: string;
}

const WIDTH = 540;
const HEIGHT = 810;

const COLORS = {
  background: "#ffffff",
  gradientStart: "#0a2463",
  gradientEnd: "#1a3a7a",
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

function drawPoster(
  ctx: CanvasRenderingContext2D,
  props: SchoolPosterProps
) {
  const { schoolName, theme, date, location, grade, highlights, contactName, contactPhone } = props;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // 顶部渐变条
  const gradient = ctx.createLinearGradient(0, 0, 0, 70);
  gradient.addColorStop(0, COLORS.gradientStart);
  gradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, 70);

  // 主标题
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("研学活动招募", WIDTH / 2, 28);

  // 学校名
  ctx.font = "13px 'Noto Sans SC', sans-serif";
  ctx.fillText(schoolName || "学校名称", WIDTH / 2, 48);

  let y = 88;

  // 分隔线
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 18;
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 15px 'Noto Sans SC', sans-serif";
  ctx.textAlign = "left";

  // 研学主题（突出显示）
  if (theme) {
    ctx.fillStyle = COLORS.primary;
    ctx.font = "bold 17px 'Noto Sans SC', sans-serif";
    ctx.fillText("🎯 " + theme, 24, y);
    y += 28;
  }

  // 活动基本信息
  ctx.fillStyle = COLORS.text;
  ctx.font = "14px 'Noto Sans SC', sans-serif";
  const infoItems = [
    { icon: "📅", label: "活动时间：", value: date || "待填写" },
    { icon: "📍", label: "活动地点：", value: location || "待填写" },
    { icon: "👨‍👩‍👧", label: "参与年级：", value: grade || "待填写" },
  ];

  infoItems.forEach((item) => {
    ctx.fillStyle = COLORS.lightText;
    ctx.font = "13px 'Noto Sans SC', sans-serif";
    ctx.fillText(item.icon + item.label, 24, y);
    const labelWidth = ctx.measureText(item.icon + item.label).width;
    ctx.fillStyle = COLORS.primary;
    ctx.font = "bold 14px 'Noto Sans SC', sans-serif";
    ctx.fillText(item.value, 24 + labelWidth, y);
    y += 26;
  });

  y += 6;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 18;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'Noto Sans SC', sans-serif";
  ctx.fillText("⭐ 活动亮点", 24, y);

  y += 24;
  const validHighlights = highlights.length >= 3
    ? highlights.slice(0, 3)
    : [...highlights, "精彩纷呈", "寓教于乐"].slice(0, 3);

  validHighlights.forEach((highlight, i) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = "14px 'Noto Sans SC', sans-serif";
    const emoji = ["🌟", "✨", "💡"][i];
    ctx.fillText(`${emoji} ${highlight}`, 24, y);
    y += 26;
  });

  y += 8;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 18;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'Noto Sans SC', sans-serif";
  ctx.fillText("📞 联系我们", 24, y);

  y += 28;
  ctx.fillStyle = COLORS.text;
  ctx.font = "15px 'Noto Sans SC', sans-serif";
  if (contactName) {
    ctx.fillText("联系人：" + contactName, 24, y);
    y += 26;
  }
  if (contactPhone) {
    ctx.fillStyle = COLORS.primary;
    ctx.font = "bold 18px 'Noto Sans SC', sans-serif";
    ctx.fillText("📞 " + contactPhone, 24, y);
  }

  // 底部渐变条
  const bottomY = HEIGHT - 55;
  const bottomGradient = ctx.createLinearGradient(0, bottomY, 0, HEIGHT);
  bottomGradient.addColorStop(0, COLORS.gradientStart);
  bottomGradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, bottomY, WIDTH, 55);
}
export async function generateSchoolPoster(
  props: SchoolPosterProps
): Promise<string> {
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

export function SchoolPosterCanvas(props: SchoolPosterProps) {
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
          download="school-poster.png"
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

export function SchoolPosterModal({
  props,
  onClose,
}: {
  props: SchoolPosterProps;
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
    link.download = "school-poster.png";
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