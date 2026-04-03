"use client";

import { useRef, useEffect, useState } from "react";

export interface SchoolPosterProps {
  schoolName: string;
  theme: string;
  date: string;
  location: string;
  grade: string;
  highlights: string[];
  contactInfo?: string;
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

function drawPoster(
  ctx: CanvasRenderingContext2D,
  props: SchoolPosterProps
) {
  const { schoolName, theme, date, location, grade, highlights, contactInfo } = props;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const gradient = ctx.createLinearGradient(0, 0, 0, 60);
  gradient.addColorStop(0, COLORS.gradientStart);
  gradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'PingFang SC', 'Microsoft YaHei', serif";
  ctx.textAlign = "center";
  ctx.fillText("研学活动招募", WIDTH / 2, 28);

  ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText(schoolName || "学校名称", WIDTH / 2, 48);

  let y = 90;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 20;
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 15px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "left";

  const infoItems = [
    { icon: "📋", label: "活动名称：", value: theme || "待填写" },
    { icon: "📅", label: "活动时间：", value: date || "待填写" },
    { icon: "📍", label: "活动地点：", value: location || "待填写" },
    { icon: "👨‍👩‍👧", label: "参与年级：", value: grade || "待填写" },
  ];

  infoItems.forEach((item) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = "15px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.fillText(item.icon + item.label, 30, y);
    const labelWidth = ctx.measureText(item.icon + item.label).width;
    ctx.fillStyle = COLORS.primary;
    ctx.fillText(item.value, 30 + labelWidth, y);
    y += 28;
  });

  y += 10;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 20;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText("【活动亮点】", 30, y);

  y += 24;
  const validHighlights = highlights.length >= 3 
    ? highlights.slice(0, 3) 
    : [...highlights, "待填写", "待填写"].slice(0, 3);
  
  validHighlights.forEach((highlight, i) => {
    ctx.fillStyle = COLORS.text;
    ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    const emoji = ["🌟", "✨", "💡"][i];
    ctx.fillText(`${emoji} ${highlight}`, 30, y);
    y += 24;
  });

  y += 10;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 20;
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 15px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText("📝 报名方式：", 30, y);

  y += 24;
  ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillStyle = COLORS.lightText;
  ctx.fillText("扫码报名 或 联系" + (schoolName || "学校") + "教务处", 30, y);

  y += 30;
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(30, y, WIDTH - 60, 120);

  ctx.strokeStyle = COLORS.border;
  ctx.strokeRect(40, y + 10, 80, 80);

  ctx.fillStyle = COLORS.lightText;
  ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("扫码报名", 80, y + 55);

  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(140, y + 10, 100, 60);

  ctx.strokeStyle = COLORS.border;
  ctx.strokeRect(140, y + 10, 100, 60);

  ctx.fillStyle = COLORS.lightText;
  ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText("[学校logo]", 190, y + 45);

  if (contactInfo) {
    y += 110;
    ctx.fillStyle = COLORS.lightText;
    ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("联系方式：" + contactInfo, 30, y);
  }

  const bottomY = HEIGHT - 50;
  const bottomGradient = ctx.createLinearGradient(0, bottomY, 0, HEIGHT);
  bottomGradient.addColorStop(0, COLORS.gradientStart);
  bottomGradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, bottomY, WIDTH, 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("让每一次研学都成为成长的印记", WIDTH / 2, HEIGHT - 20);
}

export async function generateSchoolPoster(
  props: SchoolPosterProps
): Promise<string> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      drawPoster(ctx, props);
    }
    resolve(canvas.toDataURL("image/png"));
  });
}

export function SchoolPosterCanvas(props: SchoolPosterProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState<string>("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawPoster(ctx, props);
        setDataUrl(canvas.toDataURL("image/png"));
      }
    }
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
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        drawPoster(ctx, props);
        setDataUrl(canvas.toDataURL("image/png"));
      }
    }
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