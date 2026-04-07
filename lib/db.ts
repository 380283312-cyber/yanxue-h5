/**
 * 数据库抽象层 / Database Abstraction Layer
 *
 * 用途：解耦业务逻辑与数据持久化方式
 * 目前使用 localStorage，后续可替换为 PostgreSQL / MongoDB / Supabase / D1 等后端
 *
 * 使用方式：
 *   import { db } from '@/lib/db';
 *   await db.courses.list();        // 列出课程
 *   await db.courses.get(id);       // 获取单条
 *   await db.courses.create(data);  // 新增
 *   await db.courses.update(id, data); // 更新
 *   await db.courses.delete(id);    // 删除
 */

export interface Course {
  id: string;
  name: string;
  destination: string;
  days: number;
  grade: string;
  interest: string;
  price?: string;
  features: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  studentName: string;
  school?: string;
  grade: string;
  base: string;
  theme: string;
  date?: string;
  location?: string;
  summary: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Itinerary {
  id: string;
  destination: string;
  days: number;
  grade: string;
  interest?: string;
  intentionBase?: string;
  content: string;
  createdAt: string;
}

export interface OrgProfile {
  id: string;
  name: string;
  type: string;
  location: string;
  targetAge: string;
  features: string;
  price?: string;
  contactInfo?: string;
  createdAt: string;
}

export interface SchoolProfile {
  id: string;
  name: string;
  theme: string;
  grade: string;
  days: number;
  location?: string;
  budget?: string;
  highlights: string[];
  contactInfo?: string;
  createdAt: string;
}

// ─── localStorage 实现（当前默认）─────────────────────────────────────────────

function getCollection<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCollection<T>(key: string, data: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now() {
  return new Date().toISOString();
}

// ─── 数据库接口实现 ─────────────────────────────────────────────────────────

export const db = {
  courses: {
    key: "yanxue_courses",
    list(filter?: { destination?: string; grade?: string }) {
      let items = getCollection<Course>(this.key);
      if (filter?.destination) items = items.filter(c => c.destination === filter.destination);
      if (filter?.grade) items = items.filter(c => c.grade === filter.grade);
      return Promise.resolve(items);
    },
    get(id: string) {
      const items = getCollection<Course>(this.key);
      return Promise.resolve(items.find(c => c.id === id) ?? null);
    },
    create(data: Omit<Course, "id" | "createdAt" | "updatedAt">) {
      const items = getCollection<Course>(this.key);
      const item: Course = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
      items.push(item);
      setCollection(this.key, items);
      return Promise.resolve(item);
    },
    update(id: string, data: Partial<Course>) {
      const items = getCollection<Course>(this.key);
      const idx = items.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve(null);
      items[idx] = { ...items[idx], ...data, updatedAt: now() };
      setCollection(this.key, items);
      return Promise.resolve(items[idx]);
    },
    delete(id: string) {
      const items = getCollection<Course>(this.key);
      setCollection(this.key, items.filter(c => c.id !== id));
      return Promise.resolve();
    },
  },

  reports: {
    key: "yanxue_reports",
    list() { return Promise.resolve(getCollection<Report>(this.key)); },
    get(id: string) {
      const items = getCollection<Report>(this.key);
      return Promise.resolve(items.find(c => c.id === id) ?? null);
    },
    create(data: Omit<Report, "id" | "createdAt" | "updatedAt">) {
      const items = getCollection<Report>(this.key);
      const item: Report = { ...data, id: genId(), createdAt: now(), updatedAt: now() };
      items.push(item);
      setCollection(this.key, items);
      return Promise.resolve(item);
    },
    update(id: string, data: Partial<Report>) {
      const items = getCollection<Report>(this.key);
      const idx = items.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve(null);
      items[idx] = { ...items[idx], ...data, updatedAt: now() };
      setCollection(this.key, items);
      return Promise.resolve(items[idx]);
    },
    delete(id: string) {
      const items = getCollection<Report>(this.key);
      setCollection(this.key, items.filter(c => c.id !== id));
      return Promise.resolve();
    },
  },

  itineraries: {
    key: "yanxue_itineraries",
    list() { return Promise.resolve(getCollection<Itinerary>(this.key)); },
    get(id: string) {
      const items = getCollection<Itinerary>(this.key);
      return Promise.resolve(items.find(c => c.id === id) ?? null);
    },
    create(data: Omit<Itinerary, "id" | "createdAt">) {
      const items = getCollection<Itinerary>(this.key);
      const item: Itinerary = { ...data, id: genId(), createdAt: now() };
      items.push(item);
      setCollection(this.key, items);
      return Promise.resolve(item);
    },
    delete(id: string) {
      const items = getCollection<Itinerary>(this.key);
      setCollection(this.key, items.filter(c => c.id !== id));
      return Promise.resolve();
    },
  },

  orgs: {
    key: "yanxue_orgs",
    list() { return Promise.resolve(getCollection<OrgProfile>(this.key)); },
    get(id: string) {
      const items = getCollection<OrgProfile>(this.key);
      return Promise.resolve(items.find(c => c.id === id) ?? null);
    },
    create(data: Omit<OrgProfile, "id" | "createdAt">) {
      const items = getCollection<OrgProfile>(this.key);
      const item: OrgProfile = { ...data, id: genId(), createdAt: now() };
      items.push(item);
      setCollection(this.key, items);
      return Promise.resolve(item);
    },
    update(id: string, data: Partial<OrgProfile>) {
      const items = getCollection<OrgProfile>(this.key);
      const idx = items.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve(null);
      items[idx] = { ...items[idx], ...data };
      setCollection(this.key, items);
      return Promise.resolve(items[idx]);
    },
    delete(id: string) {
      const items = getCollection<OrgProfile>(this.key);
      setCollection(this.key, items.filter(c => c.id !== id));
      return Promise.resolve();
    },
  },

  schools: {
    key: "yanxue_schools",
    list() { return Promise.resolve(getCollection<SchoolProfile>(this.key)); },
    get(id: string) {
      const items = getCollection<SchoolProfile>(this.key);
      return Promise.resolve(items.find(c => c.id === id) ?? null);
    },
    create(data: Omit<SchoolProfile, "id" | "createdAt">) {
      const items = getCollection<SchoolProfile>(this.key);
      const item: SchoolProfile = { ...data, id: genId(), createdAt: now() };
      items.push(item);
      setCollection(this.key, items);
      return Promise.resolve(item);
    },
    update(id: string, data: Partial<SchoolProfile>) {
      const items = getCollection<SchoolProfile>(this.key);
      const idx = items.findIndex(c => c.id === id);
      if (idx === -1) return Promise.resolve(null);
      items[idx] = { ...items[idx], ...data };
      setCollection(this.key, items);
      return Promise.resolve(items[idx]);
    },
    delete(id: string) {
      const items = getCollection<SchoolProfile>(this.key);
      setCollection(this.key, items.filter(c => c.id !== id));
      return Promise.resolve();
    },
  },
};
