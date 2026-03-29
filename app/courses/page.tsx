"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { courses, Course } from "@/data/courses";

// ─── Category Config ─────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: "全部", value: "全部" },
  { label: "红色教育", value: "红色教育", color: "#ef4444", bg: "#fef2f2", emoji: "🔴" },
  { label: "传统文化", value: "传统文化", color: "#d97706", bg: "#fffbeb", emoji: "🟡" },
  { label: "劳动实践", value: "劳动实践", color: "#16a34a", bg: "#f0fdf4", emoji: "🟢" },
  { label: "自然生态", value: "自然生态", color: "#16a34a", bg: "#f0fdf4", emoji: "🌿" },
  { label: "国防科工", value: "国防科工", color: "#2563eb", bg: "#eff6ff", emoji: "🔵" },
  { label: "国情教育", value: "国情教育", color: "#2563eb", bg: "#eff6ff", emoji: "🔷" },
  { label: "其他", value: "其他", color: "#6b7280", bg: "#f9fafb", emoji: "⚪" },
];

function getCategoryConfig(classify: string) {
  return CATEGORIES.find((c) => c.value === classify) ?? CATEGORIES[7];
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function CourseModal({ course, onClose }: { course: Course; onClose: () => void }) {
  const cat = getCategoryConfig(course.classify);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header" style={{ background: cat.bg }}>
          <div className="modal-emoji" style={{ background: cat.color + "22" }}>
            <span style={{ fontSize: "32px" }}>{cat.emoji}</span>
          </div>
          <div className="modal-header-info">
            <div className="modal-tag" style={{ background: cat.color + "22", color: cat.color }}>
              {cat.emoji} {course.classify}
            </div>
            <h2 className="modal-title">{course.name}</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="关闭">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Meta */}
        <div className="modal-meta">
          {course.days && course.days !== "0" && (
            <div className="modal-meta-item">
              <span className="modal-meta-icon">📅</span>
              <span>{course.days}天</span>
            </div>
          )}
          {course.fee && course.fee !== "待定" && (
            <div className="modal-meta-item">
              <span className="modal-meta-icon">💰</span>
              <span>{course.fee}</span>
            </div>
          )}
          {course.crowd && (
            <div className="modal-meta-item">
              <span className="modal-meta-icon">👥</span>
              <span>{course.crowd}</span>
            </div>
          )}
          {course.fee === "待定" && (
            <div className="modal-meta-item">
              <span className="modal-meta-icon">💰</span>
              <span>费用待定</span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="modal-body">
          {course.introduction ? (
            <div className="modal-section">
              <div className="modal-section-title">📖 课程介绍</div>
              <p className="modal-text">{course.introduction}</p>
            </div>
          ) : null}

          {course.target ? (
            <div className="modal-section">
              <div className="modal-section-title">🎯 研学目标</div>
              <p className="modal-text">{course.target}</p>
            </div>
          ) : null}

          {!course.introduction && !course.target && (
            <div className="modal-empty">
              <span>暂无详细介绍</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ─────────────────────────────────────────────────────────────

function CourseCard({ course, onClick }: { course: Course; onClick: () => void }) {
  const cat = getCategoryConfig(course.classify);

  return (
    <div className="course-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}>
      {/* Color block */}
      <div className="course-card-cover" style={{ background: `linear-gradient(135deg, ${cat.color}18 0%, ${cat.color}35 100%)` }}>
        <span className="course-card-emoji">{cat.emoji}</span>
        <div className="course-card-days" style={{ background: cat.color + "33", color: cat.color }}>
          {course.days && course.days !== "0" ? `${course.days}天` : ""}
        </div>
      </div>

      {/* Info */}
      <div className="course-card-info">
        <h3 className="course-card-name">{course.name}</h3>
        <div className="course-card-footer">
          <span
            className="course-card-tag"
            style={{ background: cat.bg, color: cat.color }}
          >
            {cat.emoji} {course.classify}
          </span>
          {course.fee && course.fee !== "待定" ? (
            <span className="course-card-fee">{course.fee}</span>
          ) : (
            <span className="course-card-fee course-card-fee--pending">费用待定</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchCat = activeCategory === "全部" || c.classify === activeCategory;
      const matchSearch = searchQuery.trim() === "" || c.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCategoryClick = useCallback((cat: string) => {
    setActiveCategory(cat);
  }, []);

  return (
    <div className="app-container">
      <Header />
      {/* Back nav */}
      <div className="courses-back-bar">
        <button className="courses-back-btn" onClick={() => router.push("/")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          返回
        </button>
        <span className="courses-back-title">课程广场</span>
        <div style={{ width: 48 }} />
      </div>
      <div className="courses-page">
      {/* Search Bar */}
      <div className="courses-search-wrap">
        <div className="courses-search">
          <svg className="courses-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className="courses-search-input"
            type="text"
            placeholder="搜索课程名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="courses-search-clear" onClick={() => setSearchQuery("")} aria-label="清除搜索">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="courses-filter">
        <div className="courses-filter-scroll">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.value;
            const catColor = "color" in cat ? cat.color : "#01c3a3";
            const catBg = "bg" in cat ? cat.bg : "#f0fdf9";
            return (
              <button
                key={cat.value}
                className={`courses-filter-chip ${isActive ? "active" : ""}`}
                style={
                  isActive
                    ? { background: catColor, color: "#fff", borderColor: catColor }
                    : { background: catBg, color: catColor, borderColor: catColor + "44" }
                }
                onClick={() => handleCategoryClick(cat.value)}
              >
                {"emoji" in cat && <span>{cat.emoji}</span>}
                {cat.label}
                {cat.value !== "全部" && (
                  <span className="courses-filter-count" style={isActive ? { background: "rgba(255,255,255,0.25)", color: "#fff" } : { background: catColor + "22", color: catColor }}>
                    {courses.filter((c) => c.classify === cat.value).length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Course Count */}
      <div className="courses-count">
        共找到 <strong>{filtered.length}</strong> 门课程
      </div>

      {/* Course Grid */}
      {filtered.length > 0 ? (
        <div className="courses-grid">
          {filtered.map((course, idx) => (
            <CourseCard
              key={`${course.name}-${idx}`}
              course={course}
              onClick={() => setSelectedCourse(course)}
            />
          ))}
        </div>
      ) : (
        <div className="courses-empty">
          <div className="courses-empty-icon">🔍</div>
          <div className="courses-empty-title">未找到相关课程</div>
          <div className="courses-empty-desc">试试其他关键词或分类</div>
          <button className="courses-empty-reset" onClick={() => { setSearchQuery(""); setActiveCategory("全部"); }}>
            重置筛选
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCourse && (
        <CourseModal course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}
    </div>
    </div>
  );
}
