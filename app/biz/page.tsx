"use client";

import { useState } from "react";
import Link from "next/link";
import { buildSystemPrompt, FRIENDLY_ERROR_MESSAGE, streamChatViaAPI } from "@/lib/minimax";
import { SchoolPosterModal, SchoolPosterProps } from "@/components/SchoolPosterCanvas";
import { OrgPosterModal, OrgPosterProps } from "@/components/OrgPosterCanvas";

type BizType = "org" | "school";

const SHARE_URL = "https://www.woaiyanxue.cn";

export default function BizPage() {
  const [bizType, setBizType] = useState<BizType>("org");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [view, setView] = useState<"form" | "result">("form");
  const [showPosterModal, setShowPosterModal] = useState(false);
  const [posterProps, setPosterProps] = useState<SchoolPosterProps | null>(null);
  const [showOrgPosterModal, setShowOrgPosterModal] = useState(false);
  const [orgPosterProps, setOrgPosterProps] = useState<OrgPosterProps | null>(null);

  const extractSchoolPosterInfo = (resultText: string): SchoolPosterProps => {
    const getMatch = (pattern: RegExp, defaultValue: string): string => {
      const match = resultText.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    const schoolName = getMatch(/学校名称：([^\n]+)/, schoolForm.name || "待填写");
    const theme = getMatch(/活动主题：([^\n]+)/, schoolForm.theme || "待填写");
    const date = getMatch(/活动时间：([^\n]+)/, "待填写");
    const location = getMatch(/活动地点：([^\n]+)/, schoolForm.location || "待填写");
    const grade = getMatch(/参与年级：([^\n]+)/, schoolForm.grade || "待填写");
    const highlight1 = getMatch(/活动亮点1：([^\n]+)/, "精彩纷呈");
    const highlight2 = getMatch(/活动亮点2：([^\n]+)/, "寓教于乐");
    const highlight3 = getMatch(/活动亮点3：([^\n]+)/, "收获满满");
    const contactInfo = getMatch(/联系方式：([^\n]+)/, "");

    return {
      schoolName,
      theme,
      date,
      location,
      grade,
      highlights: [highlight1, highlight2, highlight3],
      contactInfo: contactInfo || undefined,
    };
  };

  const extractOrgPosterInfo = (resultText: string): OrgPosterProps => {
    const getMatch = (pattern: RegExp, defaultValue: string): string => {
      const match = resultText.match(pattern);
      return match ? match[1].trim() : defaultValue;
    };

    const orgName = getMatch(/机构名称：([^\n]+)/, orgForm.name || "待填写");
    const orgType = getMatch(/机构类型：([^\n]+)/, orgForm.type || "研学机构");
    const location = getMatch(/所在地：([^\n]+)/, orgForm.location || "待填写");
    const targetAge = getMatch(/适合年龄：([^\n]+)/, orgForm.targetAge || "待填写");
    const price = getMatch(/参考价格：([^\n]+)/, orgForm.price || "");
    const contactInfo = getMatch(/联系方式：([^\n]+)/, "");

    let features = "";
    const featuresMatch = resultText.match(/【课程介绍】[\s\S]*?【/);
    if (featuresMatch) {
      features = featuresMatch[0]
        .replace(/【课程介绍】/, "")
        .replace(/【.*$/, "")
        .trim()
        .slice(0, 200);
    }
    if (!features) {
      features = orgForm.features || "机构特色和课程介绍";
    }

    return {
      orgName,
      orgType,
      location,
      targetAge,
      features,
      price: price || undefined,
      contactInfo: contactInfo || undefined,
    };
  };

  const handleGeneratePoster = () => {
    const props = extractSchoolPosterInfo(result);
    setPosterProps(props);
    setShowPosterModal(true);
  };

  const handleGenerateOrgPoster = () => {
    const props = extractOrgPosterInfo(result);
    setOrgPosterProps(props);
    setShowOrgPosterModal(true);
  };

  // Org form
  const [orgForm, setOrgForm] = useState({
    name: "",
    type: "研学基地",
    location: "",
    targetAge: "小学3-6年级",
    features: "",
    price: "",
  });

  // School form
  const [schoolForm, setSchoolForm] = useState({
    name: "",
    grade: "初一",
    theme: "",
    days: "3",
    location: "",
    budget: "",
  });

  const buildOrgPrompt = () =>
    `你是一位专业的研学营销文案专家。请为以下研学机构生成一套完整的宣传材料：

机构名称：${orgForm.name}
机构类型：${orgForm.type}
所在地：${orgForm.location}
适合年龄段：${orgForm.targetAge}
核心特色：${orgForm.features || "（未填写）"}
参考价格：${orgForm.price || "（未填写）"}

请生成以下三部分内容：

---
## 一、机构专属宣传页（约300字）

包含：一句话卖点、机构介绍、为什么选我们（3个亮点）、适合人群推荐

---
## 二、致家长的一封信（约400字）

格式规范，语气专业温暖，包含：活动意义、行程亮点、安全保障、期待参与

---
## 三、3天研学行程大纲

按日期分，写清楚每天的主题、活动内容、学习目标

---
要求：语言专业有吸引力，适合微信传播。

请在结果末尾按以下格式输出招生海报所需信息（请严格按此格式）：

【海报信息】
机构名称：${orgForm.name}
机构类型：${orgForm.type}
所在地：${orgForm.location || "待填写"}
适合年龄：${orgForm.targetAge}
参考价格：${orgForm.price || "待填写"}
联系方式：待填写`;

  const buildSchoolPrompt = () =>
    `你是一位专业的学校研学活动策划专家。请为以下学校生成一套完整的研学活动方案：

学校名称：${schoolForm.name}
活动主题：${schoolForm.theme}
适合年级：${schoolForm.grade}
活动时长：${schoolForm.days}天
活动地点：${schoolForm.location || "（待定）"}
预算范围：${schoolForm.budget || "（待定）"}

请生成以下三部分内容：

---
## 一、研学活动方案（约500字）

包含：活动背景、活动目标、主题解读、行程安排（按天）、学习评估方式

---
## 二、致家长的一封信（约400字）

包含：活动意义、行程安排、安全保障措施、所需物品清单、家长配合事项

---
## 三、安全预案要点

包含：风险识别、预防措施、应急处理流程、责任分工

---
要求：符合学校规范，语言严谨专业，适合直接使用。

请在结果末尾按以下格式输出招募海报所需信息（请严格按此格式）：

【海报信息】
学校名称：${schoolForm.name}
活动主题：${schoolForm.theme}
活动时间：请根据活动时长生成，如"2025年X月X日-X日"或具体日期
活动地点：${schoolForm.location || "待填写"}
参与年级：${schoolForm.grade}
活动亮点1：请从上述方案中提取1个最具吸引力的亮点（15字以内）
活动亮点2：请从上述方案中提取1个最具吸引力的亮点（15字以内）
活动亮点3：请从上述方案中提取1个最具吸引力的亮点（15字以内）
联系方式：待填写`;

  const handleGenerate = async () => {
    const prompt = bizType === "org" ? buildOrgPrompt() : buildSchoolPrompt();
    setLoading(true);
    setResult("");
    setView("result");

    let fullResponse = "";

    try {
      await streamChatViaAPI({
        messages: [
          { role: "user" as const, content: buildSystemPrompt() },
          { role: "user" as const, content: prompt },
        ],
        onChunk: (text: string) => {
          fullResponse += text;
          setResult(fullResponse);
        },
        onDone: () => setLoading(false),
        onError: (err: Error) => {
          setResult(FRIENDLY_ERROR_MESSAGE);
          setLoading(false);
        },
      });
    } catch (err) {
      setResult(FRIENDLY_ERROR_MESSAGE);
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      alert("已复制到剪贴板");
    } catch {
      alert(result);
    }
  };

  const canGenerate =
    bizType === "org"
      ? orgForm.name.trim()
      : schoolForm.name.trim() && schoolForm.theme.trim();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        background: "#f3f4f6",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'PingFang SC', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(135deg, #0a2463 0%, #1a3a7a 100%)",
          color: "white",
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{ color: "white", fontSize: "14px", textDecoration: "none", flexShrink: 0 }}
        >
          ← 返回
        </Link>
        <span style={{ fontSize: "17px", fontWeight: 600, flex: 1, textAlign: "center" }}>
          🏢 B端服务
        </span>
        <div style={{ width: 40 }} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: "max(16px, env(safe-area-inset-bottom))", WebkitOverflowScrolling: "touch", overscrollBehavior: "contain" }}>
        {view === "form" ? (
          <>
            {/* Type toggle */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                background: "#e5e7eb",
                borderRadius: "16px",
                padding: "4px",
                marginBottom: "16px",
              }}
            >
              {(["org", "school"] as BizType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setBizType(t)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "12px",
                    background: bizType === t ? "white" : "transparent",
                    color: bizType === t ? "#0a2463" : "#6b7280",
                    border: "none",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer",
                    boxShadow: bizType === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                  }}
                >
                  {t === "org" ? "🏢 机构版" : "🏫 学校版"}
                </button>
              ))}
            </div>

            {/* Form card */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              }}
            >
              <h2
                style={{
                  color: "#0a2463",
                  fontSize: "18px",
                  fontWeight: 700,
                  marginBottom: "4px",
                }}
              >
                {bizType === "org"
                  ? "🏢 机构宣传材料生成"
                  : "🏫 学校研学方案生成"}
              </h2>
              <p style={{ color: "#6b7280", fontSize: "13px", marginBottom: "16px", lineHeight: 1.5 }}>
                {bizType === "org"
                  ? "输入机构信息，AI 生成专属宣传页、家长信、行程大纲"
                  : "输入学校和活动信息，AI 生成完整研学方案、家长信、安全预案"}
              </p>

              {bizType === "org" ? (
                <>
                  <FormGroup label="机构名称 *" required>
                    <input
                      style={inputStyle}
                      placeholder="例如：北京探知研学基地"
                      value={orgForm.name}
                      onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup label="机构类型">
                      <select
                        style={inputStyle}
                        value={orgForm.type}
                        onChange={(e) => setOrgForm((f) => ({ ...f, type: e.target.value }))}
                      >
                        {["研学基地", "营地", "旅行社", "培训机构", "其他"].map((t) => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </FormGroup>
                    <FormGroup label="适合年龄">
                      <select
                        style={inputStyle}
                        value={orgForm.targetAge}
                        onChange={(e) => setOrgForm((f) => ({ ...f, targetAge: e.target.value }))}
                      >
                        {["小学1-2年级", "小学3-6年级", "初中生", "高中生", "全年龄段"].map(
                          (a) => (
                            <option key={a}>{a}</option>
                          )
                        )}
                      </select>
                    </FormGroup>
                  </FormRow>
                  <FormGroup label="所在地">
                    <input
                      style={inputStyle}
                      placeholder="例如：北京·延庆"
                      value={orgForm.location}
                      onChange={(e) => setOrgForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup label="核心特色">
                    <input
                      style={inputStyle}
                      placeholder="例如：自然探索、科技体验、历史文化"
                      value={orgForm.features}
                      onChange={(e) => setOrgForm((f) => ({ ...f, features: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup label="参考价格（选填）">
                    <input
                      style={inputStyle}
                      placeholder="例如：499元/人起"
                      value={orgForm.price}
                      onChange={(e) => setOrgForm((f) => ({ ...f, price: e.target.value }))}
                    />
                  </FormGroup>
                </>
              ) : (
                <>
                  <FormGroup label="学校名称 *" required>
                    <input
                      style={inputStyle}
                      placeholder="例如：北京市第一中学"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </FormGroup>
                  <FormRow>
                    <FormGroup label="参与年级">
                      <select
                        style={inputStyle}
                        value={schoolForm.grade}
                        onChange={(e) => setSchoolForm((f) => ({ ...f, grade: e.target.value }))}
                      >
                        {[
                          "小学3年级", "小学4年级", "小学5年级", "小学6年级",
                          "初一", "初二", "初三", "高一", "高二", "高三",
                        ].map((g) => (
                          <option key={g}>{g}</option>
                        ))}
                      </select>
                    </FormGroup>
                    <FormGroup label="活动天数">
                      <select
                        style={inputStyle}
                        value={schoolForm.days}
                        onChange={(e) => setSchoolForm((f) => ({ ...f, days: e.target.value }))}
                      >
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <option key={d}>{d}天</option>
                        ))}
                      </select>
                    </FormGroup>
                  </FormRow>
                  <FormGroup label="研学主题 *" required>
                    <input
                      style={inputStyle}
                      placeholder="例如：走进人工智能，体验科技魅力"
                      value={schoolForm.theme}
                      onChange={(e) => setSchoolForm((f) => ({ ...f, theme: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup label="活动地点（选填）">
                    <input
                      style={inputStyle}
                      placeholder="例如：深圳·腾讯总部"
                      value={schoolForm.location}
                      onChange={(e) => setSchoolForm((f) => ({ ...f, location: e.target.value }))}
                    />
                  </FormGroup>
                  <FormGroup label="预算范围（选填）">
                    <input
                      style={inputStyle}
                      placeholder="例如：500-800元/人"
                      value={schoolForm.budget}
                      onChange={(e) => setSchoolForm((f) => ({ ...f, budget: e.target.value }))}
                    />
                  </FormGroup>
                </>
              )}

              <button
                onClick={handleGenerate}
                disabled={!canGenerate || loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  marginTop: "8px",
                  background: canGenerate && !loading
                    ? "linear-gradient(135deg, #0a2463 0%, #1a3a7a 100%)"
                    : "#d1d5db",
                  color: "white",
                  border: "none",
                  borderRadius: "16px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: canGenerate && !loading ? "pointer" : "not-allowed",
                  boxShadow: canGenerate && !loading ? "0 4px 12px rgba(10,36,99,0.3)" : "none",
                }}
              >
                {loading ? "🔄 生成中，请稍候..." : "🚀 一键生成宣传材料"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Result view */}
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <span style={{ color: "#0a2463", fontSize: "16px", fontWeight: 700 }}>
                  {bizType === "org" ? "🏢 机构宣传材料" : "🏫 学校研学方案"}
                </span>
                <button
                  onClick={() => setView("form")}
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    borderRadius: "20px",
                    padding: "6px 14px",
                    fontSize: "13px",
                    color: "#6b7280",
                    cursor: "pointer",
                  }}
                >
                  ← 重新生成
                </button>
              </div>

              <div
                style={{
                  color: "#374151",
                  fontSize: "14px",
                  lineHeight: 1.8,
                  whiteSpace: "pre-wrap",
                }}
              >
                {result}
                {loading && (
                  <span style={{ display: "inline-block", marginLeft: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "6px",
                        height: "6px",
                        background: "#0a2463",
                        borderRadius: "50%",
                        marginRight: "4px",
                        animation: "bounce 1.4s infinite",
                      }}
                    />
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCopy}
              style={{
                width: "100%",
                padding: "14px",
                background: "white",
                border: "1.5px solid #0a2463",
                borderRadius: "16px",
                color: "#0a2463",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                marginBottom: "12px",
              }}
            >
              📋 复制结果
            </button>

            {bizType === "school" && !loading && (
              <button
                onClick={handleGeneratePoster}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #01c3a3 0%, #01a383 100%)",
                  border: "none",
                  borderRadius: "16px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🖨️ 生成招募海报
              </button>
            )}

            {bizType === "org" && !loading && (
              <button
                onClick={handleGenerateOrgPoster}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, #01c3a3 0%, #01a383 100%)",
                  border: "none",
                  borderRadius: "16px",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                🖨️ 生成招生海报
              </button>
            )}
          </>
        )}
      </div>

      {showPosterModal && posterProps && (
        <SchoolPosterModal
          props={posterProps}
          onClose={() => setShowPosterModal(false)}
        />
      )}

      {showOrgPosterModal && orgPosterProps && (
        <OrgPosterModal
          props={orgPosterProps}
          onClose={() => setShowOrgPosterModal(false)}
        />
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function FormGroup({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label
        style={{
          display: "block",
          color: "#374151",
          fontSize: "13px",
          fontWeight: 500,
          marginBottom: "6px",
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        marginBottom: "12px",
      }}
    >
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "12px",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
  color: "#374151",
  background: "white",
};
