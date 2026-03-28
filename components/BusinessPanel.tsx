"use client";

import { useState, useCallback } from "react";
import { streamChat, buildSystemPrompt } from "@/lib/minimax";

type BizType = "org" | "school";

interface OrgFormData {
  name: string;
  type: string;
  location: string;
  targetAge: string;
  features: string;
  price: string;
}

interface SchoolFormData {
  name: string;
  grade: string;
  theme: string;
  days: string;
  location: string;
  budget: string;
}

export default function BusinessPanel() {
  const [activeType, setActiveType] = useState<BizType>("org");
  const [activeTab, setActiveTab] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  // Org form
  const [orgForm, setOrgForm] = useState<OrgFormData>({
    name: "",
    type: "研学基地",
    location: "",
    targetAge: "小学3-6年级",
    features: "",
    price: "",
  });

  // School form
  const [schoolForm, setSchoolForm] = useState<SchoolFormData>({
    name: "",
    grade: "初一",
    theme: "",
    days: "3",
    location: "",
    budget: "",
  });

  const buildOrgPrompt = (f: OrgFormData) =>
    `你是一位专业的研学营销文案专家。请为以下研学机构生成一套完整的宣传材料：

机构名称：${f.name}
机构类型：${f.type}
所在地：${f.location}
适合年龄段：${f.targetAge}
核心特色：${f.features || "（未填写）"}
参考价格：${f.price || "（未填写）"}

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
要求：语言专业有吸引力，适合微信传播。`;

  const buildSchoolPrompt = (f: SchoolFormData) =>
    `你是一位专业的学校研学活动策划专家。请为以下学校生成一套完整的研学活动方案：

学校名称：${f.name}
活动主题：${f.theme}
适合年级：${f.grade}
活动时长：${f.days}天
活动地点：${f.location || "（待定）"}
预算范围：${f.budget || "（待定）"}

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
要求：符合学校规范，语言严谨专业，适合直接使用。`;

  const handleGenerate = useCallback(async () => {
    const prompt = activeType === "org" ? buildOrgPrompt(orgForm) : buildSchoolPrompt(schoolForm);

    setLoading(true);
    setResult("");
    setActiveTab("result");

    let fullResponse = "";

    try {
      await streamChat({
        messages: [
          { role: "user" as const, content: buildSystemPrompt() },
          { role: "user" as const, content: prompt },
        ],
        apiKey:
          process.env.NEXT_PUBLIC_MINIMAX_API_KEY ??
          "sk-cp-cmgKG7kTdqiTqD1v7jJd3edMnKKNd_MvhEjijbhxz3KhjooC9ULMuYu05oAWLLXk11u68xkx1H30AV5qgPFn7uMTvbYv1o1HppDH3ooLdMPkRbkF4Fxey8E",
        onChunk: (text) => {
          fullResponse += text;
          setResult(fullResponse);
        },
        onDone: () => setLoading(false),
        onError: (err) => {
          fullResponse = `生成失败：${err.message}`;
          setResult(fullResponse);
          setLoading(false);
        },
      });
    } catch (err) {
      setResult(`生成失败：${err instanceof Error ? err.message : "未知错误"}`);
      setLoading(false);
    }
  }, [activeType, orgForm, schoolForm]);

  const handleReset = () => {
    setResult("");
    setActiveTab("form");
    setOrgForm({ name: "", type: "研学基地", location: "", targetAge: "小学3-6年级", features: "", price: "" });
    setSchoolForm({ name: "", grade: "初一", theme: "", days: "3", location: "", budget: "" });
  };

  return (
    <div className="biz-panel">
      {/* Type toggle */}
      <div className="biz-type-toggle">
        <button
          className={`biz-type-btn ${activeType === "org" ? "active" : ""}`}
          onClick={() => { setActiveType("org"); handleReset(); }}
        >
          🏢 机构版
        </button>
        <button
          className={`biz-type-btn ${activeType === "school" ? "active" : ""}`}
          onClick={() => { setActiveType("school"); handleReset(); }}
        >
          🏫 学校版
        </button>
      </div>

      {activeTab === "form" ? (
        <div className="biz-form">
          {activeType === "org" ? (
            <>
              <div className="biz-form-title">🏢 机构宣传材料生成</div>
              <p className="biz-form-desc">输入机构信息，AI 生成专属宣传页、家长信、行程大纲</p>

              <div className="form-group">
                <label className="form-label">机构名称 *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：北京探知研学基地"
                  value={orgForm.name}
                  onChange={(e) => setOrgForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">机构类型</label>
                  <select
                    className="form-select"
                    value={orgForm.type}
                    onChange={(e) => setOrgForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {["研学基地", "营地", "旅行社", "培训机构", "其他"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">适合年龄</label>
                  <select
                    className="form-select"
                    value={orgForm.targetAge}
                    onChange={(e) => setOrgForm((f) => ({ ...f, targetAge: e.target.value }))}
                  >
                    {["小学1-2年级", "小学3-6年级", "初中生", "高中生", "全年龄段"].map((a) => (
                      <option key={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">所在地</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：北京·延庆"
                  value={orgForm.location}
                  onChange={(e) => setOrgForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">核心特色</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：自然探索、科技体验、历史文化"
                  value={orgForm.features}
                  onChange={(e) => setOrgForm((f) => ({ ...f, features: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">参考价格（选填）</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：499元/人起"
                  value={orgForm.price}
                  onChange={(e) => setOrgForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </>
          ) : (
            <>
              <div className="biz-form-title">🏫 学校研学方案生成</div>
              <p className="biz-form-desc">输入学校和活动信息，AI 生成完整研学方案、家长信、安全预案</p>

              <div className="form-group">
                <label className="form-label">学校名称 *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：北京市第一中学"
                  value={schoolForm.name}
                  onChange={(e) => setSchoolForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">参与年级</label>
                  <select
                    className="form-select"
                    value={schoolForm.grade}
                    onChange={(e) => setSchoolForm((f) => ({ ...f, grade: e.target.value }))}
                  >
                    {["小学3年级", "小学4年级", "小学5年级", "小学6年级", "初一", "初二", "初三", "高一", "高二", "高三"].map((g) => (
                      <option key={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">活动天数</label>
                  <select
                    className="form-select"
                    value={schoolForm.days}
                    onChange={(e) => setSchoolForm((f) => ({ ...f, days: e.target.value }))}
                  >
                    {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                      <option key={d}>{d}天</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">研学主题 *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：走进人工智能，体验科技魅力"
                  value={schoolForm.theme}
                  onChange={(e) => setSchoolForm((f) => ({ ...f, theme: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">活动地点（选填）</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：深圳·腾讯总部"
                  value={schoolForm.location}
                  onChange={(e) => setSchoolForm((f) => ({ ...f, location: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">预算范围（选填）</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="例如：500-800元/人"
                  value={schoolForm.budget}
                  onChange={(e) => setSchoolForm((f) => ({ ...f, budget: e.target.value }))}
                />
              </div>
            </>
          )}

          <button
            className="generate-btn"
            onClick={handleGenerate}
            disabled={
              loading ||
              (activeType === "org" ? !orgForm.name.trim() : !schoolForm.name.trim() || !schoolForm.theme.trim())
            }
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="spinner" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                AI 生成中...
              </span>
            ) : (
              "🚀 一键生成宣传材料"
            )}
          </button>
        </div>
      ) : (
        <div className="biz-result">
          <div className="result-header">
            <span className="result-title">
              {activeType === "org" ? "🏢 机构宣传材料" : "🏫 学校研学方案"}
            </span>
            <button className="back-btn" onClick={handleReset}>
              ← 重新生成
            </button>
          </div>
          <div className="report-card">
            <div className="report-text" style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.8" }}>
              {result}
              {loading && (
                <span style={{ display: "inline-block" }}>
                  <span className="typing-dot" style={{ background: "var(--primary)" }} />
                  <span className="typing-dot" style={{ background: "var(--primary)" }} />
                  <span className="typing-dot" style={{ background: "var(--primary)" }} />
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
