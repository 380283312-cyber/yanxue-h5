"use client";

import { useState, useEffect, useRef } from "react";

export interface PrintableReportProps {
  studentName: string;
  school: string;
  grade: string;
  base: string;
  theme: string;
  date: string;
  summary: string;
  records: string[];
  reflection: string;
}

export async function generateReportImage(props: PrintableReportProps): Promise<string> {
  const { studentName, school, grade, base, theme, date, summary, records, reflection } = props;

  const canvas = document.createElement("canvas");
  const W = 1120;
  const H = 793;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#01c3a3";
  ctx.fillRect(0, 0, W, 8);
  ctx.fillStyle = "#00a88a";
  ctx.fillRect(0, 8, W, 4);

  ctx.fillStyle = "#faf8f4";
  ctx.fillRect(0, H - 12, W, 12);
  ctx.fillStyle = "#00a88a";
  ctx.fillRect(0, H - 12, W, 4);
  ctx.fillStyle = "#01c3a3";
  ctx.fillRect(0, H - 8, W, 4);

  ctx.fillStyle = "#1a3a7a";
  ctx.font = 'bold 28px "Noto Serif", "SimSun", serif';
  ctx.textAlign = "center";
  ctx.fillText("【研学旅行结业报告】", W / 2, 70);

  ctx.fillStyle = "#1a3a7a";
  ctx.font = 'bold 18px "Noto Serif", "SimSun", serif';
  ctx.fillText(theme, W / 2, 100);

  ctx.strokeStyle = "#c5c5c5";
  ctx.setLineDash([8, 4]);
  ctx.beginPath();
  ctx.moveTo(60, 120);
  ctx.lineTo(W - 60, 120);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#333";
  ctx.font = '16px "Noto Serif", "SimSun", serif';
  ctx.textAlign = "left";

  const leftX = 80;
  const rightX = 450;
  const lineHeight = 32;
  let y = 160;

  ctx.fillText(`学生姓名：${studentName}`, leftX, y);
  ctx.fillText(`学校：${school || "__________"}`, rightX, y);
  y += lineHeight;

  ctx.fillText(`年级：${grade}`, leftX, y);
  ctx.fillText(`基地：${base || "__________"}`, rightX, y);
  y += lineHeight;

  ctx.fillText(`主题：${theme}`, leftX, y);
  ctx.fillText(`时间：${date || "__________"}`, rightX, y);

  ctx.strokeStyle = "#1a3a7a";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, y + 25);
  ctx.lineTo(W - 60, y + 25);
  ctx.stroke();

  y += 60;
  ctx.fillStyle = "#1a3a7a";
  ctx.font = 'bold 17px "Noto Serif", "SimSun", serif';
  ctx.fillText("【研学概要】", leftX, y);

  ctx.fillStyle = "#444";
  ctx.font = '14px "Noto Serif", "SimSun", serif';
  y += 25;
  const summaryLines = wrapText(ctx, summary || "_________________________________________________", W - 140, 18);
  summaryLines.forEach((line) => {
    ctx.fillText(line, leftX, y);
    y += 20;
  });

  y += 20;
  ctx.fillStyle = "#1a3a7a";
  ctx.font = 'bold 17px "Noto Serif", "SimSun", serif';
  ctx.fillText("【研学记录】", leftX, y);
  y += 25;

  ctx.fillStyle = "#444";
  ctx.font = '14px "Noto Serif", "SimSun", serif';
  records.forEach((record, i) => {
    const recordText = `第${i + 1}天：${record || "_________________________________________________"}`;
    const recordLines = wrapText(ctx, recordText, W - 140, 18);
    recordLines.forEach((line) => {
      ctx.fillText(line, leftX, y);
      y += 20;
    });
  });

  y += 20;
  ctx.fillStyle = "#1a3a7a";
  ctx.font = 'bold 17px "Noto Serif", "SimSun", serif';
  ctx.fillText("【收获与反思】", leftX, y);
  y += 25;

  ctx.fillStyle = "#444";
  ctx.font = '14px "Noto Serif", "SimSun", serif';
  const reflectionLines = wrapText(ctx, reflection || "_________________________________________________", W - 140, 18);
  reflectionLines.forEach((line) => {
    ctx.fillText(line, leftX, y);
    y += 20;
  });

  const stampY = H - 100;
  ctx.strokeStyle = "#c0392b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(W - 120, stampY, 45, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(W - 120, stampY, 35, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#c0392b";
  ctx.font = 'bold 14px "Noto Serif", "SimSun", serif';
  ctx.textAlign = "center";
  ctx.fillText("盖章区", W - 120, stampY - 5);
  ctx.fillText("学校盖章", W - 120, stampY + 15);

  ctx.fillStyle = "#1a3a7a";
  ctx.font = '12px "Noto Serif", "SimSun", serif';
  ctx.fillText("—— 研学旅行结业报告 ——", W / 2, H - 30);

  return canvas.toDataURL("image/png");
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, fontSize: number): string[] {
  const lines: string[] = [];
  const chars = text.split("");
  let currentLine = "";

  ctx.font = `${fontSize}px "Noto Serif", "SimSun", serif`;

  for (const char of chars) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine !== "") {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

interface PrintableReportCanvasProps extends PrintableReportProps {
  onImageGenerated?: (dataUrl: string) => void;
}

export default function PrintableReportCanvas(props: PrintableReportCanvasProps) {
  const [dataUrl, setDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    generateReportImage(props)
      .then((url) => {
        if (mounted) {
          setDataUrl(url);
          props.onImageGenerated?.(url);
        }
      })
      .catch((e) => {
        if (mounted) setError(e instanceof Error ? e.message : "生成失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [props.studentName, props.school, props.grade, props.base, props.theme, props.date, props.summary, props.records, props.reflection]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: "#666" }}>
        正在生成报告...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40, color: "#c0392b" }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ width: "100%", overflow: "auto", background: "#f0f0f0", padding: 16 }}>
      <img
        src={dataUrl}
        alt="研学报告预览"
        style={{ width: "100%", maxWidth: 800, display: "block", margin: "0 auto", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
      />
    </div>
  );
}