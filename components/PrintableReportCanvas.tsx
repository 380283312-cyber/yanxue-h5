"use client";

import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

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
  contactName?: string;
  contactPhone?: string;
  contactOrg?: string;
}

function buildReportHTML(props: PrintableReportProps): string {
  const {
    studentName, school, grade, base, theme, date, summary,
    records, reflection, contactName, contactPhone, contactOrg
  } = props;

  // Contact info card
  const contactCard = (contactName || contactPhone || contactOrg) ? `
  <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1.5px solid #01c3a3;border-radius:10px;padding:10pt 14pt;margin:8pt 0;display:flex;gap:12pt;align-items:center;flex-wrap:wrap">
    ${contactOrg ? `<div style="flex:1;min-width:120px"><div style="font-size:8pt;color:#888;margin-bottom:2pt">🏢 组织机构</div><div style="font-size:10pt;font-weight:bold;color:#065f46">${contactOrg}</div></div>` : ""}
    ${contactName ? `<div style="flex:1;min-width:100px"><div style="font-size:8pt;color:#888;margin-bottom:2pt">👩‍🏫 研学导师</div><div style="font-size:10pt;font-weight:bold;color:#065f46">${contactName}</div></div>` : ""}
    ${contactPhone ? `<div style="flex:1;min-width:100px"><div style="font-size:8pt;color:#888;margin-bottom:2pt">📞 联系电话</div><div style="font-size:10pt;font-weight:bold;color:#065f46">${contactPhone}</div></div>` : ""}
  </div>` : "";

  // Records: if real data use it, else show 3-day template
  const hasRecords = records && records.length > 0 && records.some(r => r?.trim());
  const dayNames = ["第一天", "第二天", "第三天"];
  const recordsHTML = hasRecords
    ? records.map((r, i) => `
    <div style="margin-bottom:12pt;background:#fafafa;border-radius:8px;padding:8pt 10pt;border-left:3px solid #01c3a3">
      <div style="font-weight:bold;color:#01c3a3;font-size:11pt;margin-bottom:4pt">📅 ${dayNames[i] || `第${i+1}天`}</div>
      <div style="font-size:10.5pt;line-height:1.8;color:#333">${r}</div>
    </div>`).join("")
    : [0,1,2].map(d => `
    <div style="margin-bottom:12pt;background:#fafafa;border-radius:8px;padding:8pt 10pt;border-left:3px solid #01c3a3">
      <div style="font-weight:bold;color:#01c3a3;font-size:11pt;margin-bottom:6pt">📅 ${dayNames[d]}</div>
      ${["日　　期：", "活动主题：", "活动地点：", "学习内容：", "学生收获："].map(f => `
        <div style="display:flex;align-items:center;margin:3px 0">
          <span style="font-weight:bold;color:#555;width:80px;font-size:10pt">${f}</span>
          <span style="flex:1;border-bottom:1px dashed #ccc;height:14px"></span>
        </div>`).join("")}
    </div>`).join("");

  // Reflection with richer styling
  const reflectionItems = reflection?.trim()
    ? [{ icon: "🌱", label: "知识层面", color: "#065f46", border: "#01c3a3", bg: "#f0fdf4" },
       { icon: "⚡", label: "能力层面", color: "#92400e", border: "#f59e0b", bg: "#fffbeb" },
       { icon: "💚", label: "情感层面", color: "#9f1239", border: "#f43f5e", bg: "#fff1f2" }]
      .map(item => `
      <div style="margin:5px 0;padding:6pt 8pt;background:${item.bg};border-left:3px solid ${item.border};border-radius:0 4px 4px 0">
        <span style="font-weight:bold;color:${item.color};font-size:10pt;margin-right:6pt">${item.icon} ${item.label}：</span>
        <span style="color:#333;font-size:10pt;line-height:1.6">${reflection}</span>
      </div>`).join("")
    : [{ icon: "🌱", label: "知识层面", color: "#065f46", border: "#01c3a3", bg: "#f0fdf4" },
       { icon: "⚡", label: "能力层面", color: "#92400e", border: "#f59e0b", bg: "#fffbeb" },
       { icon: "💚", label: "情感层面", color: "#9f1239", border: "#f43f5e", bg: "#fff1f2" }]
      .map(item => `
      <div style="margin:5px 0;padding:6pt 8pt;background:${item.bg};border-left:3px solid ${item.border};border-radius:0 4px 4px 0">
        <span style="font-weight:bold;color:${item.color};font-size:10pt">${item.icon} ${item.label}：</span>
        <span style="border-bottom:1px dashed ${item.border};height:14px;display:inline-block;width:55%;margin-left:6px"></span>
      </div>`).join("");

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif; background:#fff; }
  .page { width:210mm; min-height:297mm; padding:14mm 16mm; background:#fff; position:relative; }
  .teal-top { position:absolute; top:0; left:0; right:0; height:10mm; background:linear-gradient(90deg,#01c3a3,#00a88a); }
  .teal-top-2 { position:absolute; top:10mm; left:0; right:0; height:2.5mm; background:#00896f; }
  .main-title { text-align:center; font-size:19pt; font-weight:bold; color:#1a3a7a; padding-top:20mm; letter-spacing:2px; }
  .subtitle { text-align:center; font-size:11.5pt; color:#01c3a3; margin-top:5pt; font-weight:600; }
  .divider { border-top:2px solid #01c3a3; margin:7pt 0; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:5pt 14pt; margin:7pt 0; }
  .info-item { font-size:10pt; display:flex; align-items:center; }
  .info-label { font-weight:bold; color:#444; min-width:70px; }
  .info-line { flex:1; border-bottom:1px solid #ccc; height:14px; }
  .section { margin:10pt 0; }
  .section-title { font-size:12.5pt; font-weight:bold; color:#1a3a7a; border-left:3mm solid #01c3a3; padding-left:3.5mm; margin:8pt 0 5pt; line-height:1.5; }
  .section-line { border-bottom:1px solid #01c3a3; margin-bottom:4pt; opacity:0.4; }
  .footer { position:absolute; bottom:0; left:0; right:0; height:7mm; background:linear-gradient(90deg,#01c3a3,#00896f); display:flex; align-items:center; justify-content:center; }
  .footer-text { color:white; font-size:9pt; letter-spacing:1px; }
  @media print { body { -webkit-print-color-adjust:exact; } }
</style>
</head>
<body>
<div class="page">
  <div class="teal-top"></div>
  <div class="teal-top-2"></div>

  <div class="main-title">📜 研学旅行结业报告</div>
  <div class="subtitle">🏫 ${base || "研学基地"} &nbsp;·&nbsp; 🎯 ${theme || "研学主题"}</div>
  <div class="divider"></div>

  ${contactCard}

  <div class="info-grid">
    <div class="info-item"><span class="info-label">学生姓名：</span><span class="info-line"></span><span style="margin-left:4px;font-weight:bold;color:#1a3a7a">${studentName || ""}</span></div>
    <div class="info-item"><span class="info-label">学　　校：</span><span class="info-line"></span><span style="margin-left:4px;font-weight:bold;color:#1a3a7a">${school || ""}</span></div>
    <div class="info-item"><span class="info-label">年　　级：</span><span class="info-line"></span><span style="margin-left:4px;font-weight:bold;color:#1a3a7a">${grade || ""}</span></div>
    <div class="info-item"><span class="info-label">研学时间：</span><span class="info-line"></span><span style="margin-left:4px;font-weight:bold;color:#1a3a7a">${date || ""}</span></div>
  </div>

  <div class="section">
    <div class="section-title">📋 研学概要</div>
    <div class="section-line"></div>
    ${summary?.trim()
      ? `<p style="font-size:10.5pt;line-height:1.9;color:#222;padding:4pt 0">${summary}</p>`
      : '<div style="height:35mm"></div>'}
  </div>

  <div class="section">
    <div class="section-title">📅 研学活动记录</div>
    <div class="section-line"></div>
    ${recordsHTML}
  </div>

  <div class="section">
    <div class="section-title">🌟 收获与反思</div>
    <div class="section-line"></div>
    ${reflectionItems}
  </div>

  <div class="section">
    <div class="section-title">🏠 家长评语</div>
    <div class="section-line"></div>
    <div style="height:25mm;border:1px dashed #ccc;border-radius:6px;padding:6pt"></div>
  </div>

  <div class="section">
    <div class="section-title">📝 老师/领队结语</div>
    <div class="section-line"></div>
    <div style="height:25mm;border:1px dashed #ccc;border-radius:6px;padding:6pt"></div>
  </div>

  <div style="margin-top:8pt;padding-top:6pt;border-top:1px solid #ddd;display:flex;justify-content:space-between;font-size:8.5pt;color:#888">
    <span>学生签名：________________</span>
    <span>老师签名：________________</span>
    <span>日　期：________________</span>
  </div>

  <div class="footer">
    <div class="footer-text">🔔 研学报告 · ${base || "研学基地"} · ${contactPhone || ""}</div>
  </div>
</div>
</body></html>`;
}

export async function generateReportPDF(props: PrintableReportProps): Promise<{ pdf: string; png: string }> {
  const html = buildReportHTML(props);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:absolute;width:210mm;height:297mm;top:-9999px;left:-9999px;border:none;";
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) throw new Error("无法创建iframe文档");
  iframeDoc.open();
  iframeDoc.write(html);
  iframeDoc.close();
  await new Promise(resolve => {
    iframe.contentWindow?.addEventListener("load", resolve);
    setTimeout(resolve, 2000);
  });
  try { await iframeDoc.fonts.ready; await new Promise(r => setTimeout(r, 300)); } catch (_) {}

  const pageEl = iframeDoc.querySelector(".page") as HTMLElement;
  if (!pageEl) throw new Error("报告模板未找到");
  const canvas = await html2canvas(pageEl, {
    scale: 2, useCORS: true, allowTaint: false, logging: false,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = 210, ph = 297;
  pdf.addImage(canvas.toDataURL("image/jpeg", 0.95), "JPEG", 0, 0, pw, ph);
  const pdfDataUrl = pdf.output("datauristring");
  const pngDataUrl = canvas.toDataURL("image/png");
  document.body.removeChild(iframe);
  return { pdf: pdfDataUrl, png: pngDataUrl };
}

// React component
interface Props extends PrintableReportProps {
  onImageGenerated?: (url: string) => void;
}

export default function PrintableReportCanvas(props: Props) {
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");
    generateReportPDF(props)
      .then(({ pdf }) => {
        if (mounted) { setPdfUrl(pdf); props.onImageGenerated?.(pdf); }
      })
      .catch(e => { if (mounted) setError(e instanceof Error ? e.message : "生成失败"); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [props.studentName, props.school, props.grade, props.base, props.theme, props.date, props.summary, JSON.stringify(props.records), props.reflection, props.contactName, props.contactPhone, props.contactOrg]);

  if (loading) return <div style={{textAlign:"center",padding:40,color:"#666",fontSize:14}}>正在生成报告...</div>;
  if (error) return <div style={{textAlign:"center",padding:40,color:"#c0392b",fontSize:14}}>错误：{error}</div>;

  return (
    <div style={{width:"100%",background:"#f0f0f0",padding:16}}>
      <div style={{textAlign:"center",marginBottom:12}}>
        <a href={pdfUrl} download={`研学报告_${props.studentName||"学生"}.pdf`}
          style={{display:"inline-block",background:"#01c3a3",color:"#fff",padding:"10px 24px",borderRadius:24,textDecoration:"none",fontSize:14,fontWeight:"bold"}}>
          📥 下载 PDF（可打印）
        </a>
      </div>
      {pdfUrl && (
        <iframe src={pdfUrl} title="研学报告预览" style={{width:"100%",height:600,border:"none",boxShadow:"0 4px 12px rgba(0,0,0,0.15)",background:"#fff"}} />
      )}
    </div>
  );
}
