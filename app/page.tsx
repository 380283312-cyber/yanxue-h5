"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ChatBubble, { ChatMessage } from "@/components/ChatBubble";
import ChatInput from "@/components/ChatInput";
import ShareModal from "@/components/ShareModal";
import PosterCanvas from "@/components/PosterCanvas";
import ReportPosterCanvas from "@/components/ReportPosterCanvas";
import PaywallModal from "@/components/PaywallModal";
import ItineraryShareSheet from "@/components/ItineraryShareSheet";
import { buildSystemPrompt, FRIENDLY_ERROR_MESSAGE, streamChatViaAPI } from "@/lib/minimax";
import { checkUsage, recordUsage, getRemaining } from "@/lib/useUsageTracker";
import { useChatStore } from "@/store/chatStore";
import { useItineraryStore } from "@/store/itineraryStore";
import { useReportStore } from "@/store/reportStore";

// ─── Quick Prompts ──────────────────────────────────────────────────────────
// 基于720条真实研学课程数据分析设计，贴合数据分布
// 数据洞察：西安(48)>北京(30)>成都(15)；红色教育(155)/传统文化(153)/劳动实践(141)最热门；1天课程最多(164门)；费用集中在0-500元(106门)

const QUICK_PROMPTS = [
  {
    label: "🔍 帮我搜西安的研学课程",
    icon: "🔍",
    accent: "#01c3a3",
    prompt: "请从研学知识库中搜索西安的研学课程，包括课程名称、适合年级、天数、费用、亮点介绍。",
  },
  {
    label: "🗺️ 帮我规划成都5天研学",
    icon: "🗺️",
    accent: "#01c3a3",
    prompt: "请为初中生规划一份成都5天研学行程，包含每天景点安排、学习目标、费用预算和行前准备清单。",
  },
  {
    label: "📝 生成我的研学报告",
    icon: "📝",
    accent: "#01c3a3",
    prompt: "请帮我生成一份研学报告模板，包含：基本信息、研学概要、详细记录（按天）、收获与反思、评语区域。需要填写的内容请用占位符标注。",
  },
  {
    label: "🏫 帮我配置研学方案",
    icon: "🏫",
    accent: "#01c3a3",
    prompt: "我需要为学校（或研学基地）配置一套研学课程方案。请根据我的需求推荐合适的研学主题、目标客群（年级段）、课程时长、费用区间、特色亮点，以及配套的行程建议和营销卖点。",
    isBiz: true,
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
  intentionBase: string;
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
  base: string;
}

// ─── Main Page Component ─────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("chat");
  const messages = useChatStore((state) => state.messages);
  const isTyping = useChatStore((state) => state.isTyping);
  const chatStore = useChatStore();
  const setMessages = chatStore.setMessages;
  const setIsTyping = (v: boolean) => chatStore.setIsTyping(v);
  const showWelcome = useChatStore((s) => s.showWelcome);
  const setShowWelcome = (v: boolean) => chatStore.setShowWelcome(v);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Itinerary state
  const itineraryStore = useItineraryStore();
  const { formData: itineraryForm, result: itineraryResult, isLoading: itineraryLoading } = itineraryStore;
  const setItineraryForm = (v: Partial<ItineraryFormData> | ((prev: ItineraryFormData) => Partial<ItineraryFormData>)) => {
    if (typeof v === "function") itineraryStore.setFormData(v(itineraryStore.formData));
    else itineraryStore.setFormData(v);
  };
  const setItineraryResult = itineraryStore.setResult;
  const setItineraryLoading = itineraryStore.setIsLoading;

  // Report state
  const reportStore = useReportStore();
  const { formData: reportForm, result: reportResult, isLoading: reportLoading } = reportStore;
  const setReportForm = (v: Partial<ReportFormData> | ((prev: ReportFormData) => Partial<ReportFormData>)) => {
    if (typeof v === "function") reportStore.setFormData(v(reportStore.formData));
    else reportStore.setFormData(v);
  };
  const setReportResult = reportStore.setResult;
  const setReportLoading = reportStore.setIsLoading;

  // Share modal state
  const [shareVisible, setShareVisible] = useState(false);
  const openShare = useCallback(() => setShareVisible(true), []);
  const closeShare = useCallback(() => setShareVisible(false), []);

  // Itinerary share sheet state
  const [showItineraryShare, setShowItineraryShare] = useState(false);

  // Paywall modal state
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [paywallAction, setPaywallAction] = useState<"chat" | "itinerary" | "report">("chat");
  const [freeRemaining, setFreeRemaining] = useState(getRemaining());

  // Sync free remaining on mount/return
  useEffect(() => {
    setFreeRemaining(getRemaining());
  }, [paywallVisible]); // refresh after paywall closes

  const openPaywall = (action: "chat" | "itinerary" | "report") => {
    setPaywallAction(action);
    setPaywallVisible(true);
  };

  const handleUnlock = () => {
    // In production: trigger payment flow here
    // For now: just activate VIP in localStorage
    localStorage.setItem("yanxue_vip", "1");
    setFreeRemaining(999);
  };

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
      // 检查免费次数
      const status = checkUsage();
      if (!status.allowed) {
        openPaywall("chat");
        return;
      }
      setShowWelcome(false);
      recordUsage();
      setFreeRemaining(Math.max(0, status.remaining - 1));
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

        await streamChatViaAPI({
          messages: allMessages,
          onChunk: (text: string) => {
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
          onError: (err: Error) => {
            fullResponse = FRIENDLY_ERROR_MESSAGE;
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
          err instanceof Error ? err.message : FRIENDLY_ERROR_MESSAGE;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId
              ? { ...m, content: errorMsg, isTyping: false }
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
      const status = checkUsage();
      if (!status.allowed) {
        openPaywall("chat");
        return;
      }
      setShowWelcome(false);
      recordUsage();
      setFreeRemaining(Math.max(0, status.remaining - 1));
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

        await streamChatViaAPI({
          messages: allMessages,
          onChunk: (text: string) => {
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
          onError: (err: Error) => {
            fullResponse = FRIENDLY_ERROR_MESSAGE;
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
          err instanceof Error ? err.message : FRIENDLY_ERROR_MESSAGE;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === typingId
              ? { ...m, content: errorMsg, isTyping: false }
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

    const status = checkUsage();
    if (!status.allowed) {
      openPaywall("itinerary");
      return;
    }
    recordUsage();
    setFreeRemaining(Math.max(0, status.remaining - 1));

    setItineraryLoading(true);
    setItineraryResult("");

    try {
      const prompt = `请为${grade}学生规划一份${destination}${days}天研学方案。

要求：
- 目的地：${destination}
- 天数：${days}天
- 年级：${grade}${interest ? `\n- 兴趣方向：${interest}` : ""}${itineraryForm.intentionBase ? `\n- 意向基地：${itineraryForm.intentionBase}` : ""}

请生成完整行程规划，包括：
1. 总体行程概览
2. 每天详细安排（时间、活动地点、学习目标、注意事项）
3. 费用预算汇总
4. 行前准备清单`;

      const systemContent = buildSystemPrompt();
      let fullResponse = "";

      await streamChatViaAPI({
        messages: [{ role: "user" as const, content: systemContent }, { role: "user" as const, content: prompt }],
        onChunk: (text: string) => {
          fullResponse += text;
          setItineraryResult(fullResponse);
        },
        onDone: () => setItineraryLoading(false),
        onError: (err: Error) => {
          fullResponse = FRIENDLY_ERROR_MESSAGE;
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

    const status = checkUsage();
    if (!status.allowed) {
      openPaywall("report");
      return;
    }
    recordUsage();
    setFreeRemaining(Math.max(0, status.remaining - 1));

    setReportLoading(true);
    setReportResult("");

    try {
      const prompt = `请帮我生成一份让人眼前一亮的研学报告，基于以下真实信息：

【基本信息】
- 姓名：${name}
- 学校：${school || "（未填写）"}
- 年级：${grade}
- 研学基地：${reportForm.base}
- 研学主题：${theme}
- 时间：${date || "（未填写）"}
- 地点：${location || "（未填写）"}

【研学概要】
${summary || "（用户未填写具体内容）"}

请按以下格式生成一份高质量研学报告，要求：数据充实、分段清晰、情感真实、适合分享展示：

═══════════════════════════════
🏛️ 【研学报告】${theme}
═══════════════════════════════

【📋 基本信息卡】
姓名：${name} ｜ 学校：${school || "—"} ｜ 年级：${grade}
研学基地：${reportForm.base} ｜ 时间：${date || "—"} ｜ 地点：${location || "—"}

【📊 研学数据概览】（虚构但合理的数据）
• 行走步数：约 12,000 步/天
• 学习时长：约 4 小时/天
• 参与活动：3-5 项
• 覆盖知识领域：2-3 个学科
• 综合评级：★★★★☆（四星优秀）

【📝 研学概要】（约200字）
（根据主题和基地，写一段真实感人的研学总结，体现学生的成长与收获）

【📅 详细记录】
第1天：
⏰ 08:30-09:00｜抵达基地，开营仪式
🎯 学习目标：了解基地历史与研学主题
💡 精彩瞬间：（描述一个令人印象深刻的画面）
🏆 今日收获：（用一句话总结）

第2天：...（根据基地特点继续展开）

【🌟 核心收获】
• 知识层面：（结合基地主题，写2-3个具体知识点）
• 能力层面：（写1-2个实际提升的能力）
• 情感层面：（写一段真情实感的反思）

【💪 成长评估】（雷达图文字版）
• 历史素养：████████░░ 85%
• 动手能力：██████████ 95%
• 团队协作：███████░░░ 75%
• 创新思维：████████░░ 80%
• 文化自信：██████████ 98%

【🏠 家长行动指南】
✓ 回程后可以这样延续这次研学：
  1. （具体可操作的亲子活动建议）
  2. （与研学主题相关的延伸学习建议）
  3. （推荐的相关纪录片/书籍）

【📝 老师/家长评语模板】
"这次研学让___深刻体验了___，在___方面表现突出。期待他在接下来的学习中继续保持这份热情与好奇心。"

【🎓 结业证书】（装饰性文字）
　本证书授予　${name}　同学
　已完成「${theme}」研学课程
　特此证明 ✨

报告语言亲切专业，格式美观，适合打印存档和微信分享。`;

      const systemContent = buildSystemPrompt();
      let fullResponse = "";

      await streamChatViaAPI({
        messages: [{ role: "user" as const, content: systemContent }, { role: "user" as const, content: prompt }],
        onChunk: (text: string) => {
          fullResponse += text;
          setReportResult(fullResponse);
        },
        onDone: () => {
          setReportLoading(false);
          try {
            sessionStorage.setItem('yanxue_report', JSON.stringify({
              name: `${reportForm.name}的研学报告`,
              content: fullResponse,
              studentName: reportForm.name,
              school: reportForm.school,
              grade: reportForm.grade,
              base: reportForm.base,
              theme: reportForm.theme,
              date: reportForm.date,
            }));
          } catch {}
          router.push('/report');
        },
        onError: (err: Error) => {
          fullResponse = FRIENDLY_ERROR_MESSAGE;
          setReportResult(fullResponse);
          setReportLoading(false);
        },
      });
    } catch (err) {
      setReportResult(FRIENDLY_ERROR_MESSAGE);
      setReportLoading(false);
    }
  }, [reportForm]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="app-container">
      <Header onShareClick={openShare} />
      <ShareModal
        visible={shareVisible}
        onClose={closeShare}
      />
      <PaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        actionType={paywallAction}
        onUnlock={handleUnlock}
      />

      {/* Tab Navigation */}
      <nav className="tab-nav" role="tablist">
        {[
          { id: "chat", label: "对话", icon: "💬" },
          { id: "itinerary", label: "行程规划", icon: "🗺️" },
          { id: "report", label: "报告生成", icon: "📝" },
          { id: "biz", label: "B端服务", icon: "⚙️" },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => {
              if (tab.id === "biz") {
                router.push("/biz");
              } else {
                setActiveTab(tab.id as Tab);
              }
            }}
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
                  <div className="free-usage-badge">
                    🎁 今日免费次数：<strong>{freeRemaining > 0 ? freeRemaining : 0}</strong> / 3
                    {freeRemaining === 0 && <span style={{color:"#ff6b35",marginLeft:"6px"}}>（已用完）</span>}
                  </div>
                  <div className="quick-prompts">
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp.label}
                        className={`quick-prompt-btn${qp.isBiz ? " quick-prompt-btn--biz" : ""}`}
                        style={{ "--accent": qp.accent } as React.CSSProperties}
                        onClick={() => handleQuickPrompt(qp.prompt)}
                      >
                        <span className="quick-prompt-label">{qp.label}</span>
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
              <div className="itinerary-form" style={{ flex: 1, overflowY: "auto" }}>
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
                  <select
                    id="destination"
                    className="form-select"
                    value={itineraryForm.destination}
                    onChange={(e) =>
                      setItineraryForm((f) => ({
                        ...f,
                        destination: e.target.value,
                      }))
                    }
                  >
                    {[
                      { value: "西安", label: "📍 西安（最热门）" },
                      { value: "北京", label: "📍 北京" },
                      { value: "成都", label: "📍 成都" },
                      { value: "上海", label: "📍 上海" },
                      { value: "南京", label: "📍 南京" },
                      { value: "重庆", label: "📍 重庆" },
                      { value: "杭州", label: "📍 杭州" },
                      { value: "青岛", label: "📍 青岛" },
                      { value: "长沙", label: "📍 长沙" },
                      { value: "其他城市", label: "📍 其他城市" },
                    ].map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
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
                      {[
                        { value: "0.5", label: "半天" },
                        { value: "1", label: "1天（最热门）" },
                        { value: "2", label: "2天" },
                        { value: "3", label: "3天" },
                        { value: "4", label: "4天" },
                        { value: "5", label: "5天" },
                        { value: "6", label: "6天" },
                        { value: "7", label: "7天" },
                        { value: "10", label: "10天+"} ,
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
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
                      {[
                        { value: "小学低年级", label: "小学1-3年级" },
                        { value: "小学高年级", label: "小学4-6年级" },
                        { value: "初一", label: "初一" },
                        { value: "初二", label: "初二" },
                        { value: "初三", label: "初三" },
                        { value: "高一", label: "高一" },
                        { value: "高二", label: "高二" },
                        { value: "高三", label: "高三" },
                        { value: "初中生", label: "初中生（通用）" },
                        { value: "高中生", label: "高中生（通用）" },
                        { value: "亲子", label: "亲子（家长同行）" },
                        { value: "成人", label: "成人/大学生" },
                      ].map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="interest">
                    兴趣方向（选填）
                  </label>
                  <select
                    id="interest"
                    className="form-select"
                    value={itineraryForm.interest}
                    onChange={(e) =>
                      setItineraryForm((f) => ({
                        ...f,
                        interest: e.target.value,
                      }))
                    }
                  >
                    <option value="">不限方向</option>
                    <option value="红色教育">🔴 红色教育（最热门，155门课）</option>
                    <option value="传统文化">🏛️ 传统文化（153门课）</option>
                    <option value="劳动实践">🌱 劳动实践（141门课）</option>
                    <option value="自然生态">🌿 自然生态（99门课）</option>
                    <option value="国防科工">🚀 国防科工（79门课）</option>
                    <option value="国情教育">🇨🇳 国情教育（56门课）</option>
                    <option value="其他">⚪ 其他</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="intentionBase">
                    意向基地（选填）
                  </label>
                  <input
                    id="intentionBase"
                    type="text"
                    className="form-input"
                    placeholder="例如：秦汉馆、西影电影基地"
                    value={itineraryForm.intentionBase}
                    onChange={(e) =>
                      setItineraryForm((f) => ({
                        ...f,
                        intentionBase: e.target.value,
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
                  <span className="result-title">🗺️ {itineraryForm.destination} {itineraryForm.days}天研学方案${itineraryForm.intentionBase ? ` · ${itineraryForm.intentionBase}` : ""}</span>
                  <div className="result-actions">
                    <div className="template-tags">
                      <button
                        className="template-tag"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(itineraryResult);
                          } catch {}
                        }}
                      >
                        📋 复制内容
                      </button>
                      <button
                        className="template-tag"
                        onClick={() => setShowItineraryShare(true)}
                      >
                        📤 分享行程
                      </button>
                      <button
                        className="back-btn"
                        onClick={() => {
                          setItineraryResult("");
                          setItineraryForm({ destination: "西安", days: "1", grade: "初中生", interest: "", intentionBase: "" });
                        }}
                      >
                        ← 重填
                      </button>
                    </div>
                  </div>
                </div>
                <div className="report-card" style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", minHeight: 0 }}>
                  <div className="report-text" style={{ whiteSpace: "pre-wrap", fontSize: "14px", lineHeight: "1.8", paddingBottom: "80px" }}>
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
            {showItineraryShare && (
              <ItineraryShareSheet
                visible={showItineraryShare}
                onClose={() => setShowItineraryShare(false)}
                destination={itineraryForm.destination}
                days={itineraryForm.days}
                grade={itineraryForm.grade}
                content={itineraryResult}
                intentionBase={itineraryForm.intentionBase}
              />
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
                  <label className="form-label" htmlFor="rbase">
                    研学基地 *
                  </label>
                  <input
                    id="rbase"
                    type="text"
                    className="form-input"
                    placeholder="例如：秦汉馆、西影电影基地、张裕瑞纳城堡酒庄"
                    value={reportForm.base}
                    onChange={(e) =>
                      setReportForm((f) => ({ ...f, base: e.target.value }))
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
                  disabled={!reportForm.name.trim() || !reportForm.theme.trim() || !reportForm.base.trim() || reportLoading}
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
                  <span className="result-title">📄 研学报告 · {reportForm.base}</span>
                  <div className="result-actions">
                    <div className="template-tags">
                      <button
                        className="template-tag"
                        onClick={openShare}
                      >
                        🏛️ 分享链接
                      </button>
                      <button
                        className="template-tag tag-share"
                        onClick={openShare}
                      >
                        ↗ 更多分享
                      </button>
                      <button
                        className="back-btn"
                        onClick={() => {
                          setReportResult("");
                          setReportForm({ name: "", school: "", grade: "初一", theme: "", date: "", location: "", summary: "", base: "" });
                        }}
                      >
                        ← 重填
                      </button>
                    </div>
                  </div>
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
        </div>
      </div>
    </div>
  );
}
