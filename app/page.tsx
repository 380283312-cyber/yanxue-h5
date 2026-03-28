"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ChatBubble, { ChatMessage } from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import BusinessPanel from "@/components/BusinessPanel";
import { streamChat, buildSystemPrompt } from "@/lib/minimax";

// ─── Quick Prompts ──────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  {
    label: "推荐适合初一的研学课程",
    icon: "🔍",
    color: "purple",
    prompt: "请推荐一些适合初一年级学生的研学课程，包括国内和出境选项，每个推荐请包含：课程名称、适合年级、主要内容、预期收获、参考价格区间。",
  },
  {
    label: "北京5天研学方案",
    icon: "🗺️",
    color: "blue",
    prompt: "请为一名初中生规划一份北京5天研学方案，包含每天的时间安排、活动地点、学习目标、费用预算和行前准备。",
  },
  {
    label: "生成我的研学报告",
    icon: "📝",
    color: "green",
    prompt: "请帮我生成一份研学报告模板，包含：基本信息、研学概要、详细记录（按天）、收获与反思、评语区域。需要填写的内容请用占位符标注。",
  },
];

// ─── Tab Type ────────────────────────────────────────────────────────────────

type Tab = "chat" | "itinerary" | "report" | "biz";

// ─── Itinerary Form ─────────────────────────────────────────────────────────

interface ItineraryFormData {
  destination: string;
  days: string;
  grade: string;
  interest: string;
}

// ─── Report Form ────────────────────────────────────────────────────────────

interface ReportFormData {
  name: string;
  school: string;
  grade: string;
  theme: string;
  date: string;
  location: string;
  summary: string;
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Itinerary state
  const [itineraryForm, setItineraryForm] = useState<ItineraryFormData>({
    destination: "",
    days: "5",
    grade: "初一",
    interest: "",
  });
  const [itineraryResult, setItineraryResult] = useState("");
  const [itineraryLoading, setItineraryLoading] = useState(false);

  // Report state
  const [reportForm, setReportForm] = useState<ReportFormData>({
    name: "",
    school: "",
    grade: "初一",
    theme: "",
    date: "",
    location: "",
    summary: "",
  });
  const [reportResult, setReportResult] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // ─── Auto-scroll to bottom ─────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length > 0 || isTyping) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  // ─── Welcome ────────────────────────────────────────────────────────────────

  const handleQuickPrompt = useCallback(
    async (prompt: string) => {
      setShowWelcome(false);
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      // Add typing indicator
      const typingId = `ai-typing-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isTyping: true,
        },
      ]);

      try {
        const systemContent = buildSystemPrompt() + "\n\n请确认你已经理解上述角色设定。";
        const allMessages = [
          { role: "user" as const, content: systemContent },
          { role: "user" as const, content: prompt },
        ];

        let fullResponse = "";

        await streamChat({
          messages: allMessages,
          apiKey:
            process.env.NEXT_PUBLIC_MINIMAX_API_KEY ??
            "sk-cp-cmgKG7kTdqiTqD1v7jJd3edMnKKNd_MvhEjijbhxz3KhjooC9ULMuYu05oAWLLXk11u68xkx1H30AV5qgPFn7uMTvbYv1o1HppDH3ooLdMPkRbkF4Fxey8E",
          onChunk: (text) => {
            fullResponse += text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === typingId
                  ? { ...m, content: fullResponse, isTyping: false }
                  : m
              )
            );
          },
          onDone: () => {
            setIsTyping(false);
          },
          onError: (err) => {
            fullResponse = `抱歉，遇到了一个问题：${err.message}。请稍后再试。`;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === typingId
                  ? { ...m, content: fullResponse, isTyping: false }
                  : m
              )
            );
            setIsTyping(false);
          },
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "发送消息失败，请稍后重试。";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId
              ? { ...m, content: `出错啦：${errorMsg}`, isTyping: false }
              : m
          )
        );
        setIsTyping(false);
      }
    },
    []
  );

  // ─── Chat Send ──────────────────────────────────────────────────────────────

  const handleChatSend = useCallback(
    async (text: string) => {
      setShowWelcome(false);
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      const typingId = `ai-typing-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          isTyping: true,
        },
      ]);

      try {
        const systemContent = buildSystemPrompt() + "\n\n请确认你已经理解上述角色设定。";
        const allMessages = [
          { role: "user" as const, content: systemContent },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content: text },
        ];

        let fullResponse = "";

        await streamChat({
          messages: allMessages,
          apiKey:
            process.env.NEXT_PUBLIC_MINIMAX_API_KEY ??
            "sk-cp-cmgKG7kTdqiTqD1v7jJd3edMnKKNd_MvhEjijbhxz3KhjooC9ULMuYu05oAWLLXk11u68xkx1H30AV5qgPFn7uMTvbYv1o1HppDH3ooLdMPkRbkF4Fxey8E",
          onChunk: (text) => {
            fullResponse += text;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === typingId
                  ? { ...m, content: fullResponse, isTyping: false }
                  : m
              )
            );
          },
          onDone: () => {
            setIsTyping(false);
          },
          onError: (err) => {
            fullResponse = `抱歉，遇到了一个问题：${err.message}。请稍后再试。`;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === typingId
                  ? { ...m, content: fullResponse, isTyping: false }
                  : m
              )
            );
            setIsTyping(false);
          },
        });
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "发送消息失败，请稍后重试。";
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId
              ? { ...m, content: `出错啦：${errorMsg}`, isTyping: false }
              : m
          )
        );
        setIsTyping(false);
      }
    },
    [messages]
  );

  // ─── Itinerary Generate ──────────────────────────────────────────────────────

  const handleGenerateItinerary = useCallback(async () => {
    const { destination, days, grade, interest } = itineraryForm;
    if (!destination.trim()) return;

    setItineraryLoading(true);
    setItineraryResult("");

    try {
      const prompt = `请为${grade}学生规划一份${destination}${days}天研学方案。

要求：
- 目的地：${destination}
- 天数：${days}天
- 年级：${grade}${interest ? `\n- 兴趣方向：${interest}` : ""}

请生成完整行程规划，包括：
1. 总体行程概览
2. 每天详细安排（时间、活动地点、学习目标、注意事项）
3. 费用预算汇总
4. 行前准备清单`;

      const systemContent = buildSystemPrompt();
      let fullResponse = "";

      await streamChat({
        messages: [{ role: "user" as const, content: systemContent }, { role: "user" as const, content: prompt }],
        apiKey:
          process.env.NEXT_PUBLIC_MINIMAX_API_KEY ??
          "sk-cp-cmgKG7kTdqiTqD1v7jJd3edMnKKNd_MvhEjijbhxz3KhjooC9ULMuYu05oAWLLXk11u68xkx1H30AV5qgPFn7uMTvbYv1o1HppDH3ooLdMPkRbkF4Fxey8E",
        onChunk: (text) => {
          fullResponse += text;
          setItineraryResult(fullResponse);
        },
        onDone: () => setItineraryLoading(false),
        onError: (err) => {
          fullResponse = `生成失败：${err.message}`;
          setItineraryResult(fullResponse);
          setItineraryLoading(false);
        },
      });
    } catch (err) {
      setItineraryResult(
        `生成失败：${err instanceof Error ? err.message : "未知错误"}`
      );
      setItineraryLoading(false);
    }
  }, [itineraryForm]);

  // ─── Report Generate ─────────────────────────────────────────────────────────

  const handleGenerateReport = useCallback(async () => {
    const { name, school, grade, theme, date, location, summary } = reportForm;
    if (!name.trim() || !theme.trim()) return;

    setReportLoading(true);
    setReportResult("");

    try {
      const prompt = `请帮我生成一份研学报告，基于以下信息：

基本信息：
- 姓名：${name}
- 学校：${school || "（未填写）"}
- 年级：${grade}
- 研学主题：${theme}
- 时间：${date || "（未填写）"}
- 地点：${location || "（未填写）"}

研学概要（用户填写）：
${summary || "（用户未填写具体内容）"}

请生成完整的研学报告，包含：
1. 封面信息（姓名、学校、年级、研学主题、时间、地点）
2. 研学概要（约300字总结）
3. 详细记录（按天或按主题展开，包含具体活动、学习内容、收获）
4. 收获与反思（学生的个人感悟）
5. 评语区域（家长/老师评语模板）
6. 精彩瞬间（预留照片位置，配简短说明）

报告语言亲切专业，适合存档和展示。`;

      const systemContent = buildSystemPrompt();
      let fullResponse = "";

      await streamChat({
        messages: [{ role: "user" as const, content: systemContent }, { role: "user" as const, content: prompt }],
        apiKey:
          process.env.NEXT_PUBLIC_MINIMAX_API_KEY ??
          "sk-cp-cmgKG7kTdqiTqD1v7jJd3edMnKKNd_MvhEjijbhxz3KhjooC9ULMuYu05oAWLLXk11u68xkx1H30AV5qgPFn7uMTvbYv1o1HppDH3ooLdMPkRbkF4Fxey8E",
        onChunk: (text) => {
          fullResponse += text;
          setReportResult(fullResponse);
        },
        onDone: () => setReportLoading(false),
        onError: (err) => {
          fullResponse = `生成失败：${err.message}`;
          setReportResult(fullResponse);
          setReportLoading(false);
        },
      });
    } catch (err) {
      setReportResult(
        `生成失败：${err instanceof Error ? err.message : "未知错误"}`
      );
      setReportLoading(false);
    }
  }, [reportForm]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="app-container">
      <Header />

      {/* Tab Navigation */}
      <nav className="tab-nav" role="tablist">
        {[
          { id: "chat", label: "对话", icon: "💬" },
          { id: "itinerary", label: "行程规划", icon: "🗺️" },
          { id: "report", label: "报告生成", icon: "📝" },
          { id: "biz", label: "B端服务", icon: "🏢" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id as Tab)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="tab-content">
        {/* ── Chat Panel ── */}
        <div
          role="tabpanel"
          className={`tab-panel ${activeTab === "chat" ? "active" : ""}`}
        >
          <div className="chat-panel">
            <div className="chat-messages">
              {showWelcome && messages.length === 0 && (
                <div className="welcome-screen">
                  <div className="welcome-avatar">🎓</div>
                  <h1 className="welcome-title">研学顾问小智</h1>
                  <p className="welcome-desc">
                    你好！我是研学顾问小智，专注为学生和家长提供专业的研学旅行建议。
                    <br />
                    试试快捷问题，或直接输入你的需求吧！
                  </p>
                  <div className="quick-prompts">
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        className="quick-prompt-btn"
                        onClick={() => handleQuickPrompt(qp.prompt)}
                      >
                        <span
                          className={`quick-prompt-icon ${qp.color}`}
                          aria-hidden="true"
                        >
                          {qp.icon}
                        </span>
                        {qp.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}

              {isTyping && messages.length > 0 && (
                <div className="chat-bubble-wrap ai">
                  <div className="chat-bubble-typing" aria-label="AI正在输入">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <ChatInput
              onSend={handleChatSend}
              disabled={isTyping}
            />
          </div>
        </div>

        {/* ── Itinerary Panel ── */}
        <div
          role="tabpanel"
          className={`tab-panel ${activeTab === "itinerary" ? "active" : ""}`}
        >
          <div className="itinerary-panel">
            {!itineraryResult ? (
              <div className="itinerary-form">
                <div>
                  <div className="itinerary-form-title">📍 研学行程规划</div>
                  <p style={{ fontSize: "13px", color: "var(--gray-500)", marginTop: "4px" }}>
                    填写以下信息，AI将为你生成完整的研学行程方案
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="destination">
                    目的地 *
                  </label>
                  <input
                    id="destination"
                    type="text"
                    className="form-input"
                    placeholder="例如：北京、上海、西安、成都"
                    value={itineraryForm.destination}
                    onChange={(e) =>
                      setItineraryForm((f) => ({
                        ...f,
                        destination: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="days">
                      天数
                    </label>
                    <select
                      id="days"
                      className="form-select"
                      value={itineraryForm.days}
                      onChange={(e) =>
                        setItineraryForm((f) => ({ ...f, days: e.target.value }))
                      }
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                        <option key={d} value={d}>
                          {d}天
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="grade">
                      年级
                    </label>
                    <select
                      id="grade"
                      className="form-select"
                      value={itineraryForm.grade}
                      onChange={(e) =>
                        setItineraryForm((f) => ({ ...f, grade: e.target.value }))
                      }
                    >
                      {["小学一年级", "小学二年级", "小学三年级", "小学四年级", "小学五年级", "小学六年级", "初一", "初二", "初三", "高一", "高二", "高三"].map(
                        (g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="interest">
                    兴趣方向（选填）
                  </label>
                  <input
                    id="interest"
                    type="text"
                    className="form-input"
                    placeholder="例如：历史文化、自然科技、艺术创意"
                    value={itineraryForm.interest}
                    onChange={(e) =>
                      setItineraryForm((f) => ({
                        ...f,
                        interest: e.target.value,
                      }))
                    }
                  />
                </div>

                <button
                  className="generate-btn"
                  onClick={handleGenerateItinerary}
                  disabled={!itineraryForm.destination.trim() || itineraryLoading}
                >
                  {itineraryLoading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span className="spinner" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                      AI生成中...
                    </span>
                  ) : (
                    "🚀 生成研学行程"
                  )}
                </button>
              </div>
            ) : (
              <div className={`itinerary-result ${itineraryResult ? "visible" : ""}`}>
                <div className="result-header">
                  <span className="result-title">🗺️ {itineraryForm.destination} {itineraryForm.days}天研学方案</span>
                  <button
                    className="back-btn"
                    onClick={() => {
                      setItineraryResult("");
                      setItineraryForm({ destination: "", days: "5", grade: "初一", interest: "" });
                    }}
                  >
                    ← 重新规划
                  </button>
                </div>
                <div className="report-card">
                  <div className="report-text" style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.8" }}>
                    {itineraryResult}
                    {itineraryLoading && (
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
        </div>

        {/* ── Report Panel ── */}
        <div
          role="tabpanel"
          className={`tab-panel ${activeTab === "report" ? "active" : ""}`}
        >
          <div className="report-panel">
            {!reportResult ? (
              <div className="report-form">
                <div>
                  <div className="itinerary-form-title">📝 研学报告生成</div>
                  <p style={{ fontSize: "13px", color: "var(--gray-500)", marginTop: "4px" }}>
                    填写研学基本信息，AI将为你生成完整的研学报告
                  </p>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rname">
                      姓名 *
                    </label>
                    <input
                      id="rname"
                      type="text"
                      className="form-input"
                      placeholder="学生姓名"
                      value={reportForm.name}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rgrade">
                      年级
                    </label>
                    <select
                      id="rgrade"
                      className="form-select"
                      value={reportForm.grade}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, grade: e.target.value }))
                      }
                    >
                      {["小学一年级", "小学二年级", "小学三年级", "小学四年级", "小学五年级", "小学六年级", "初一", "初二", "初三", "高一", "高二", "高三"].map(
                        (g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rschool">
                    学校（选填）
                  </label>
                  <input
                    id="rschool"
                    type="text"
                    className="form-input"
                    placeholder="学校名称"
                    value={reportForm.school}
                    onChange={(e) =>
                      setReportForm((f) => ({ ...f, school: e.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rtheme">
                    研学主题 *
                  </label>
                  <input
                    id="rtheme"
                    type="text"
                    className="form-input"
                    placeholder="例如：探访古都西安，感悟历史文明"
                    value={reportForm.theme}
                    onChange={(e) =>
                      setReportForm((f) => ({ ...f, theme: e.target.value }))
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="rdate">
                      时间（选填）
                    </label>
                    <input
                      id="rdate"
                      type="text"
                      className="form-input"
                      placeholder="如：2024年7月"
                      value={reportForm.date}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, date: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="rlocation">
                      地点（选填）
                    </label>
                    <input
                      id="rlocation"
                      type="text"
                      className="form-input"
                      placeholder="如：陕西西安"
                      value={reportForm.location}
                      onChange={(e) =>
                        setReportForm((f) => ({ ...f, location: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="rsummary">
                    研学概要（选填）
                  </label>
                  <textarea
                    id="rsummary"
                    className="form-input"
                    placeholder="请简述这次研学的主要内容和亮点..."
                    rows={3}
                    style={{ resize: "none", fieldSizing: "content" }}
                    value={reportForm.summary}
                    onChange={(e) =>
                      setReportForm((f) => ({ ...f, summary: e.target.value }))
                    }
                  />
                </div>

                <button
                  className="generate-btn"
                  onClick={handleGenerateReport}
                  disabled={!reportForm.name.trim() || !reportForm.theme.trim() || reportLoading}
                >
                  {reportLoading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <span className="spinner" style={{ borderTopColor: "white", borderColor: "rgba(255,255,255,0.3)" }} />
                      AI生成中...
                    </span>
                  ) : (
                    "📄 生成研学报告"
                  )}
                </button>
              </div>
            ) : (
              <div className={`report-result ${reportResult ? "visible" : ""}`}>
                <div className="result-header">
                  <span className="result-title">📄 研学报告</span>
                  <button
                    className="back-btn"
                    onClick={() => {
                      setReportResult("");
                      setReportForm({ name: "", school: "", grade: "初一", theme: "", date: "", location: "", summary: "" });
                    }}
                  >
                    ← 重新生成
                  </button>
                </div>
                <div className="report-card">
                  <div className="report-text">
                    {reportResult}
                    {reportLoading && (
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

          {/* ── Biz Panel ── */}
          <div
            role="tabpanel"
            className={`tab-panel ${activeTab === "biz" ? "active" : ""}`}
            style={activeTab === "biz" ? { opacity: 1, pointerEvents: "auto", display: "flex", flexDirection: "column" } : {}}
          >
            <div className="biz-panel-wrap" style={{ minHeight: "100%", background: "#f0f9f7" }}>
              <div style={{ padding: "20px", color: "#01C3A3", fontWeight: "bold", textAlign: "center" }}>
                B端服务加载中...
              </div>
              <BusinessPanel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
