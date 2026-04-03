"use client";

import { useRef, useEffect, useState } from "react";

export interface OrgPosterProps {
  orgName: string;
  orgType: string;
  location: string;
  targetAge: string;
  features: string;
  price?: string;
  contactInfo?: string;
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

function drawPoster(ctx: CanvasRenderingContext2D, props: OrgPosterProps) {
  const { orgName, orgType, location, targetAge, features, price, contactInfo } = props;

  ctx.fillStyle = COLORS.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const topGradient = ctx.createLinearGradient(0, 0, 0, 60);
  topGradient.addColorStop(0, COLORS.gradientStart);
  topGradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = topGradient;
  ctx.fillRect(0, 0, WIDTH, 60);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'PingFang SC', 'Microsoft YaHei', serif";
  ctx.textAlign = "center";
  ctx.fillText("机构招生宣传", WIDTH / 2, 28);

  let y = 85;
  ctx.fillStyle = COLORS.primary;
  ctx.font = "bold 26px 'PingFang SC', 'Microsoft YaHei', serif";
  ctx.fillText(orgName || "机构名称", WIDTH / 2, y);

  y += 28;
  ctx.fillStyle = COLORS.lightText;
  ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText(`${orgType || "研学机构"} · ${location || "所在地"}`, WIDTH / 2, y);

  y += 20;
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 25;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("【课程介绍】", 30, y);

  y += 28;
  ctx.fillStyle = COLORS.text;
  ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  
  const featuresText = features || "机构特色和课程介绍";
  const maxWidth = WIDTH - 60;
  const lineHeight = 22;
  const words = featuresText.split("");
  let line = "";
  let lineY = y;
  
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, 30, lineY);
      line = words[i];
      lineY += lineHeight;
      if (lineY > y + lineHeight * 4) break;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, 30, lineY);

  y = lineY + 30;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 25;
  ctx.fillStyle = COLORS.text;
  ctx.font = "15px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText(`【适合人群】${targetAge || "待填写"}`, 30, y);

  y += 28;
  ctx.fillText(`【参考价格】${price || "请咨询"}`, 30, y);

  y += 25;
  ctx.strokeStyle = COLORS.border;
  ctx.beginPath();
  ctx.moveTo(20, y);
  ctx.lineTo(WIDTH - 20, y);
  ctx.stroke();

  y += 25;
  ctx.fillStyle = COLORS.accent;
  ctx.font = "bold 16px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText("【联系方式】", 30, y);

  y += 28;
  ctx.fillStyle = COLORS.text;
  ctx.font = "14px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText(`📞 ${contactInfo || "请电话咨询"}`, 30, y);

  y += 24;
  ctx.fillText(`📍 ${location || "来访咨询"}`, 30, y);

  y += 30;
  ctx.fillStyle = "#f9fafb";
  ctx.fillRect(30, y, WIDTH - 60, 100);

  ctx.fillStyle = "#e5e7eb";
  ctx.fillRect(50, y + 10, 80, 80);

  ctx.fillStyle = COLORS.lightText;
  ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("扫码咨询", 90, y + 55);

  ctx.fillStyle = "#f3f4f6";
  ctx.fillRect(150, y + 20, 100, 60);

  ctx.strokeStyle = COLORS.border;
  ctx.strokeRect(150, y + 20, 100, 60);

  ctx.fillStyle = COLORS.lightText;
  ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.fillText("[机构logo]", 200, y + 55);

  const bottomY = HEIGHT - 50;
  const bottomGradient = ctx.createLinearGradient(0, bottomY, 0, HEIGHT);
  bottomGradient.addColorStop(0, COLORS.gradientStart);
  bottomGradient.addColorStop(1, COLORS.gradientEnd);
  ctx.fillStyle = bottomGradient;
  ctx.fillRect(0, bottomY, WIDTH, 50);

  ctx.fillStyle = "#ffffff";
  ctx.font = "12px 'PingFang SC', 'Microsoft YaHei', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("让孩子在体验中成长", WIDTH / 2, HEIGHT - 20);
}

export async function generateOrgPoster(props: OrgPosterProps): Promise<string> {
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

export function OrgPosterCanvas(props: OrgPosterProps) {
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