/**
 * 研学H5 免费次数追踪
 * 每天3次免费额度，记录在 localStorage
 * key: yanxue_free_count / yanxue_free_date
 */

const FREE_LIMIT = 3;
const STORAGE_KEY_COUNT = "yanxue_free_count";
const STORAGE_KEY_DATE = "yanxue_free_date";

function getToday(): string {
  return new Date().toISOString().split("T")[0]; // "2026-04-03"
}

function isBrowser(): boolean {
  try {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

function getStoredDate(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEY_DATE);
}

function getStoredCount(): number {
  if (!isBrowser()) return 0;
  const stored = localStorage.getItem(STORAGE_KEY_COUNT);
  if (!stored) return 0;
  const parsed = parseInt(stored, 10);
  return isNaN(parsed) ? 0 : parsed;
}

function resetCount(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY_COUNT, "0");
  localStorage.setItem(STORAGE_KEY_DATE, getToday());
}

function incrementCount(): number {
  if (!isBrowser()) return 0;
  const count = getStoredCount() + 1;
  localStorage.setItem(STORAGE_KEY_COUNT, String(count));
  return count;
}

/**
 * 检查是否允许使用
 * @returns {{ allowed: boolean, remaining: number, isVip: boolean }}
 * - allowed: true = 可以直接用
 * - allowed: false, isVip: false = 已用完免费次数，显示付费弹窗
 * - allowed: false, isVip: true = VIP用户，无限制
 */
export function checkUsage(): { allowed: boolean; remaining: number; isVip: boolean } {
  // 【临时开关】支付打通前先全免费，放开这里改为 true 即可启用付费
  const PAYWALL_ENABLED = false;
  if (!PAYWALL_ENABLED) {
    return { allowed: true, remaining: FREE_LIMIT, isVip: false };
  }

  if (!isBrowser()) return { allowed: true, remaining: FREE_LIMIT, isVip: false };

  // 检查VIP状态（后续接入真实VIP逻辑）
  const isVip = localStorage.getItem("yanxue_vip") === "1";
  if (isVip) {
    return { allowed: true, remaining: 999, isVip: true };
  }

  const today = getToday();
  const storedDate = getStoredDate();

  // 新的一天，重置计数
  if (storedDate !== today) {
    resetCount();
    return { allowed: true, remaining: FREE_LIMIT, isVip: false };
  }

  const count = getStoredCount();
  const remaining = FREE_LIMIT - count;

  if (remaining <= 0) {
    return { allowed: false, remaining: 0, isVip: false };
  }

  return { allowed: true, remaining, isVip: false };
}

/**
 * 记录一次使用（每次功能触发时调用）
 * @returns { allowed: boolean, remaining: number }
 */
export function recordUsage(): { allowed: boolean; remaining: number } {
  if (!isBrowser()) return { allowed: true, remaining: 0 };
  const status = checkUsage();
  if (!status.allowed) {
    return { allowed: false, remaining: 0 };
  }
  const newCount = incrementCount();
  const remaining = Math.max(0, FREE_LIMIT - newCount);
  return { allowed: true, remaining };
}

/**
 * 获取当前剩余次数（不计入本次消耗）
 */
export function getRemaining(): number {
  if (!isBrowser()) return 3;
  const { allowed, remaining, isVip } = checkUsage();
  if (isVip || allowed) return remaining;
  return 0;
}

/**
 * 激活VIP（支付成功后调用）
 */
export function activateVip(): void {
  if (!isBrowser()) return;
  localStorage.setItem("yanxue_vip", "1");
}
