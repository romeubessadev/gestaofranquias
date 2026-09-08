import type { IconKey, TintKey } from "@/pages/dashboards/icons";

/** Shared shapes reused across the five standalone dashboards. */
export interface KpiCard {
  id: string;
  label: string;
  value: string;
  icon: IconKey;
  tint: TintKey;
  delta: { value: string; positive: boolean };
  sparkline?: number[];
  sub?: string;
}

export interface QuickStat {
  id: string;
  label: string;
  value: string;
  sub: string;
  icon: IconKey;
  tint: TintKey;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ---------------------------------------------------------------------------
// Analytics dashboard
// ---------------------------------------------------------------------------

export const analyticsKpis: KpiCard[] = [
  {
    id: "revenue",
    label: "Total revenue",
    value: "$84,210",
    icon: "dollar",
    tint: "acc",
    delta: { value: "12.4%", positive: true },
    sparkline: [30, 34, 32, 40, 38, 45, 42, 50, 48, 56],
  },
  {
    id: "users",
    label: "Active users",
    value: "12,480",
    icon: "users",
    tint: "info",
    delta: { value: "8.1%", positive: true },
    sparkline: [20, 22, 21, 26, 25, 28, 30, 29, 34, 36],
  },
  {
    id: "conversion",
    label: "Conversion rate",
    value: "3.42%",
    icon: "trending",
    tint: "ok",
    delta: { value: "0.6%", positive: true },
    sparkline: [12, 14, 13, 15, 14, 17, 16, 18, 17, 19],
  },
  {
    id: "aov",
    label: "Avg. order value",
    value: "$128.50",
    icon: "cart",
    tint: "warn",
    delta: { value: "2.1%", positive: false },
    sparkline: [40, 38, 39, 36, 37, 34, 35, 33, 32, 30],
  },
];

export interface RevenueSeries {
  key: string;
  label: string;
  total: string;
  delta: string;
  data: number[];
}

export const analyticsChartTabs: RevenueSeries[] = [
  {
    key: "revenue",
    label: "Revenue",
    total: "$486,200",
    delta: "+18.2%",
    data: [32000, 34500, 31000, 38000, 41000, 39500, 44000, 47500, 45000, 51000, 49500, 54200],
  },
  {
    key: "orders",
    label: "Orders",
    total: "8,940",
    delta: "+11.6%",
    data: [560, 610, 590, 640, 700, 680, 720, 760, 740, 810, 790, 840],
  },
  {
    key: "sessions",
    label: "Sessions",
    total: "142,300",
    delta: "+9.4%",
    data: [9800, 10200, 9600, 11000, 11800, 11200, 12100, 12900, 12300, 13400, 13100, 14200],
  },
];

export const analyticsChartMonths = MONTHS;

export const analyticsTraffic = [
  { label: "Organic search", value: 38, color: "var(--acc)" },
  { label: "Direct", value: 27, color: "var(--ok)" },
  { label: "Social", value: 21, color: "var(--warn)" },
  { label: "Referral", value: 14, color: "var(--info)" },
];

export const analyticsFunnel = [
  { label: "Visitors", value: 84200, color: "var(--acc)" },
  { label: "Signups", value: 32100, color: "var(--info)" },
  { label: "Trials", value: 14800, color: "var(--warn)" },
  { label: "Customers", value: 6420, color: "var(--ok)" },
];

export interface ProductRow {
  id: string;
  name: string;
  sku: string;
  mono: string;
  tint: TintKey;
  channel: string;
  sales: string;
  revenue: string;
  status: string;
}

export const analyticsProducts: ProductRow[] = [
  { id: "p1", name: "Nimbus Wireless Headset", sku: "SKU-2281", mono: "NW", tint: "acc", channel: "Online store", sales: "1,204", revenue: "$54,180", status: "In stock" },
  { id: "p2", name: "Aurora Desk Lamp", sku: "SKU-1042", mono: "AD", tint: "info", channel: "Marketplace", sales: "986", revenue: "$28,400", status: "Low stock" },
  { id: "p3", name: "Voyage Travel Backpack", sku: "SKU-3390", mono: "VT", tint: "ok", channel: "Online store", sales: "842", revenue: "$37,890", status: "In stock" },
  { id: "p4", name: "Pulse Fitness Tracker", sku: "SKU-4471", mono: "PF", tint: "warn", channel: "Retail partner", sales: "631", revenue: "$18,930", status: "In stock" },
  { id: "p5", name: "Studio Mechanical Keyboard", sku: "SKU-5029", mono: "SM", tint: "bad", channel: "Marketplace", sales: "410", revenue: "$22,550", status: "Out of stock" },
];

export interface ActivityItem {
  id: string;
  who: string;
  text: string;
  time: string;
  icon: IconKey;
  tint: TintKey;
}

export const analyticsActivity: ActivityItem[] = [
  { id: "a1", who: "Maya Chen", text: "published a new revenue report.", time: "12 minutes ago", icon: "file", tint: "acc" },
  { id: "a2", who: "System", text: "flagged a spike in checkout errors.", time: "48 minutes ago", icon: "alert", tint: "bad" },
  { id: "a3", who: "Diego Ruiz", text: "closed the Q3 marketing campaign.", time: "2 hours ago", icon: "check", tint: "ok" },
  { id: "a4", who: "Priya Nair", text: "invited 3 new teammates to the workspace.", time: "5 hours ago", icon: "users", tint: "info" },
];

export const analyticsDevices = [
  { name: "Desktop", pct: 58, icon: "layers" as IconKey, tint: "acc" as TintKey },
  { name: "Mobile", pct: 34, icon: "users" as IconKey, tint: "ok" as TintKey },
  { name: "Tablet", pct: 8, icon: "database" as IconKey, tint: "warn" as TintKey },
];

export const analyticsGoal = { pct: 78, target: "$126k", current: "$98.4k" };

// ---------------------------------------------------------------------------
// Sales dashboard
// ---------------------------------------------------------------------------

export const salesKpis: KpiCard[] = [
  { id: "s-revenue", label: "Revenue closed", value: "$324,600", icon: "dollar", tint: "acc", delta: { value: "16.2%", positive: true } },
  { id: "s-deals", label: "Deals won", value: "186", icon: "check", tint: "ok", delta: { value: "9.4%", positive: true } },
  { id: "s-winrate", label: "Win rate", value: "38.5%", icon: "target", tint: "info", delta: { value: "2.1%", positive: true } },
  { id: "s-avgdeal", label: "Avg. deal size", value: "$1,745", icon: "briefcase", tint: "warn", delta: { value: "1.3%", positive: false } },
];

export const salesQuickStats: QuickStat[] = [
  { id: "sq1", label: "Pipeline value", value: "$862,400", sub: "142 open deals", icon: "layers", tint: "acc" },
  { id: "sq2", label: "Forecasted", value: "$410,200", sub: "This quarter", icon: "trending", tint: "ok" },
  { id: "sq3", label: "Avg. sales cycle", value: "18 days", sub: "Down from 22 days", icon: "clock", tint: "info" },
  { id: "sq4", label: "New leads", value: "94", sub: "Last 30 days", icon: "users", tint: "warn" },
];

export const salesTrend = {
  labels: MONTHS,
  data: [22000, 24500, 21000, 27000, 29500, 26800, 31200, 33500, 30800, 35400, 33900, 38200],
};

export const salesQuota = { pct: 77, target: "$420k", current: "$324k" };

export const salesQuotaReps = [
  { name: "Amara Bello", av: "AB", avBg: "linear-gradient(135deg,#7c5cff,#56a8ff)", pct: 92, color: "var(--ok)" },
  { name: "Jonas Weber", av: "JW", avBg: "linear-gradient(135deg,#33d493,#56a8ff)", pct: 84, color: "var(--ok)" },
  { name: "Lena Ito", av: "LI", avBg: "linear-gradient(135deg,#f7b84e,#f76d7d)", pct: 68, color: "var(--warn)" },
  { name: "Sam Okafor", av: "SO", avBg: "linear-gradient(135deg,#9d86ff,#7c5cff)", pct: 54, color: "var(--bad)" },
];

export const salesRegions = [
  { name: "North America", value: "$142,800", pct: 44, color: "var(--acc)" },
  { name: "Europe", value: "$88,300", pct: 27, color: "var(--info)" },
  { name: "Asia Pacific", value: "$56,900", pct: 18, color: "var(--ok)" },
  { name: "Latin America", value: "$24,100", pct: 7, color: "var(--warn)" },
  { name: "Middle East & Africa", value: "$12,500", pct: 4, color: "var(--bad)" },
];

export const salesLeaderboard = [
  { rank: 1, name: "Amara Bello", av: "AB", avBg: "linear-gradient(135deg,#7c5cff,#56a8ff)", value: "$96,400", sub: "34 deals closed", medal: "#f7b84e" },
  { rank: 2, name: "Jonas Weber", av: "JW", avBg: "linear-gradient(135deg,#33d493,#56a8ff)", value: "$81,200", sub: "29 deals closed", medal: "#c7cdd6" },
  { rank: 3, name: "Lena Ito", av: "LI", avBg: "linear-gradient(135deg,#f7b84e,#f76d7d)", value: "$68,900", sub: "24 deals closed", medal: "#d99a5c" },
  { rank: 4, name: "Sam Okafor", av: "SO", avBg: "linear-gradient(135deg,#9d86ff,#7c5cff)", value: "$52,300", sub: "19 deals closed", medal: "var(--t2)" },
  { rank: 5, name: "Nora Kim", av: "NK", avBg: "linear-gradient(135deg,#56a8ff,#33d493)", value: "$47,100", sub: "17 deals closed", medal: "var(--t2)" },
];

export interface DealRow {
  id: string;
  name: string;
  industry: string;
  av: string;
  avBg: string;
  rep: string;
  plan: string;
  amount: string;
  status: string;
  date: string;
}

export const salesRecentDeals: DealRow[] = [
  { id: "d1", name: "Northwind Traders", industry: "Retail", av: "NT", avBg: "linear-gradient(135deg,#7c5cff,#56a8ff)", rep: "Amara Bello", plan: "Enterprise", amount: "$24,600", status: "Won", date: "Jul 8" },
  { id: "d2", name: "Solace Health", industry: "Healthcare", av: "SH", avBg: "linear-gradient(135deg,#33d493,#56a8ff)", rep: "Jonas Weber", plan: "Growth", amount: "$12,400", status: "Won", date: "Jul 7" },
  { id: "d3", name: "Vertex Logistics", industry: "Logistics", av: "VL", avBg: "linear-gradient(135deg,#f7b84e,#f76d7d)", rep: "Lena Ito", plan: "Growth", amount: "$9,800", status: "Pending", date: "Jul 6" },
  { id: "d4", name: "Bright Path Media", industry: "Media", av: "BP", avBg: "linear-gradient(135deg,#9d86ff,#7c5cff)", rep: "Sam Okafor", plan: "Starter", amount: "$4,200", status: "Won", date: "Jul 4" },
  { id: "d5", name: "Cobalt Systems", industry: "Technology", av: "CS", avBg: "linear-gradient(135deg,#56a8ff,#33d493)", rep: "Nora Kim", plan: "Enterprise", amount: "$31,900", status: "Lost", date: "Jul 2" },
];

// ---------------------------------------------------------------------------
// Project dashboard
// ---------------------------------------------------------------------------

export const projectKpis: KpiCard[] = [
  { id: "pk1", label: "Active projects", value: "24", icon: "layers", tint: "acc", delta: { value: "3", positive: true }, sub: "Across 6 teams" },
  { id: "pk2", label: "Completed tasks", value: "1,286", icon: "check", tint: "ok", delta: { value: "14.2%", positive: true }, sub: "This month" },
  { id: "pk3", label: "Team velocity", value: "42 pts", icon: "trending", tint: "info", delta: { value: "5.8%", positive: true }, sub: "Per sprint avg." },
  { id: "pk4", label: "On-time rate", value: "88.4%", icon: "target", tint: "warn", delta: { value: "1.9%", positive: false }, sub: "Delivery accuracy" },
];

export const projectStatusSummary = [
  { label: "On track", count: 14, pct: 58, tint: "ok" as TintKey },
  { label: "At risk", count: 6, pct: 25, tint: "warn" as TintKey },
  { label: "Delayed", count: 2, pct: 8, tint: "bad" as TintKey },
  { label: "Completed", count: 32, pct: 92, tint: "acc" as TintKey },
];

export interface ProjectProgressRow {
  id: string;
  name: string;
  tasks: number;
  pct: number;
  team: string[];
  due: string;
  status: string;
  color: string;
}

export const projectProgress: ProjectProgressRow[] = [
  { id: "pr1", name: "Mobile app redesign", tasks: 48, pct: 82, team: ["Amara Bello", "Jonas Weber", "Lena Ito"], due: "Jul 18", status: "On track", color: "var(--ok)" },
  { id: "pr2", name: "Customer data platform", tasks: 64, pct: 46, team: ["Sam Okafor", "Nora Kim"], due: "Aug 02", status: "At risk", color: "var(--warn)" },
  { id: "pr3", name: "Checkout performance", tasks: 22, pct: 95, team: ["Priya Nair", "Diego Ruiz"], due: "Jul 12", status: "On track", color: "var(--ok)" },
  { id: "pr4", name: "Marketing site v3", tasks: 36, pct: 28, team: ["Maya Chen", "Lena Ito", "Sam Okafor"], due: "Aug 20", status: "Delayed", color: "var(--bad)" },
  { id: "pr5", name: "Internal analytics tool", tasks: 19, pct: 60, team: ["Jonas Weber"], due: "Jul 25", status: "On track", color: "var(--ok)" },
];

export const projectWorkload = [
  { name: "Amara Bello", av: "AB", avBg: "linear-gradient(135deg,#7c5cff,#56a8ff)", tasks: "12 tasks", pct: 92, color: "var(--bad)" },
  { name: "Jonas Weber", av: "JW", avBg: "linear-gradient(135deg,#33d493,#56a8ff)", tasks: "8 tasks", pct: 68, color: "var(--warn)" },
  { name: "Lena Ito", av: "LI", avBg: "linear-gradient(135deg,#f7b84e,#f76d7d)", tasks: "6 tasks", pct: 54, color: "var(--ok)" },
  { name: "Sam Okafor", av: "SO", avBg: "linear-gradient(135deg,#9d86ff,#7c5cff)", tasks: "5 tasks", pct: 41, color: "var(--ok)" },
];

export const projectDeadlines = [
  { id: "dl1", title: "Ship onboarding flow v2", proj: "Mobile app redesign", date: "Jul 12", remaining: "2 days left", urgent: true, color: "var(--bad)" },
  { id: "dl2", title: "Finalize data schema", proj: "Customer data platform", date: "Jul 14", remaining: "4 days left", urgent: true, color: "var(--warn)" },
  { id: "dl3", title: "QA regression pass", proj: "Checkout performance", date: "Jul 18", remaining: "8 days left", urgent: false, color: "var(--acc)" },
  { id: "dl4", title: "Stakeholder review", proj: "Marketing site v3", date: "Jul 22", remaining: "12 days left", urgent: false, color: "var(--info)" },
];

export const projectVelocity = [
  { sprint: "S17", planned: 38, done: 34 },
  { sprint: "S18", planned: 40, done: 36 },
  { sprint: "S19", planned: 36, done: 38 },
  { sprint: "S20", planned: 42, done: 40 },
  { sprint: "S21", planned: 44, done: 39 },
  { sprint: "S22", planned: 40, done: 42 },
  { sprint: "S23", planned: 46, done: 44 },
  { sprint: "S24", planned: 44, done: 42 },
];

export const projectActivity: ActivityItem[] = [
  { id: "pa1", who: "Priya Nair", text: "moved 4 tasks to Done in Checkout performance.", time: "20 minutes ago", icon: "check", tint: "ok" },
  { id: "pa2", who: "Diego Ruiz", text: "flagged a blocker on Customer data platform.", time: "1 hour ago", icon: "alert", tint: "bad" },
  { id: "pa3", who: "Maya Chen", text: "created a new sprint for Marketing site v3.", time: "3 hours ago", icon: "layers", tint: "acc" },
  { id: "pa4", who: "Jonas Weber", text: "commented on Mobile app redesign.", time: "6 hours ago", icon: "file", tint: "info" },
  { id: "pa5", who: "Sam Okafor", text: "invited Nora Kim to Internal analytics tool.", time: "1 day ago", icon: "users", tint: "warn" },
];

// ---------------------------------------------------------------------------
// SaaS dashboard
// ---------------------------------------------------------------------------

export const saasKpis: KpiCard[] = [
  { id: "sa1", label: "MRR", value: "$48,200", icon: "dollar", tint: "acc", delta: { value: "12%", positive: true }, sub: "Monthly recurring revenue" },
  { id: "sa2", label: "ARR", value: "$578,400", icon: "trending", tint: "ok", delta: { value: "14.6%", positive: true }, sub: "Annualized run rate" },
  { id: "sa3", label: "Churn rate", value: "1.8%", icon: "alert", tint: "bad", delta: { value: "0.3%", positive: false }, sub: "Logo churn, monthly" },
  { id: "sa4", label: "LTV : CAC", value: "4.2x", icon: "target", tint: "info", delta: { value: "0.4x", positive: true }, sub: "Blended across plans" },
];

export const saasHealth = [
  { label: "Logo churn", value: "1.8%", sub: "42 accounts", pct: 18, tint: "bad" as TintKey },
  { label: "Revenue churn", value: "1.1%", sub: "Net of expansion", pct: 11, tint: "warn" as TintKey },
  { label: "Net revenue retention", value: "114%", sub: "Trailing 12mo", pct: 100, tint: "ok" as TintKey },
  { label: "Gross margin", value: "82%", sub: "Blended", pct: 82, tint: "acc" as TintKey },
];

export const saasChart = {
  labels: MONTHS,
  data: [31200, 33500, 34100, 36800, 38200, 39900, 41500, 43100, 44800, 46200, 47100, 48200],
};

export const saasMrrDelta = { newMrr: "+$5,820", churnedMrr: "-$640" };

export const saasPlans = [
  { name: "Enterprise", color: "var(--acc)", revenue: "$26,900", subs: 210, pct: 56 },
  { name: "Growth", color: "var(--info)", revenue: "$15,100", subs: 840, pct: 31 },
  { name: "Starter", color: "var(--ok)", revenue: "$6,200", subs: 2790, pct: 13 },
];

export const saasCohortMonths = ["M0", "M1", "M2", "M3", "M4", "M5"];

export const saasCohortRows = [
  { cohort: "Feb 2026", vals: [100, 88, 81, 76, 72, 69] },
  { cohort: "Mar 2026", vals: [100, 91, 84, 79, 75, 0] },
  { cohort: "Apr 2026", vals: [100, 90, 85, 80, 0, 0] },
  { cohort: "May 2026", vals: [100, 93, 87, 0, 0, 0] },
  { cohort: "Jun 2026", vals: [100, 94, 0, 0, 0, 0] },
];

export const saasSignups = [
  { id: "su1", name: "Elena Ford", company: "Northwind Traders", time: "12m ago", av: "EF", avBg: "linear-gradient(135deg,#7c5cff,#56a8ff)", plan: "Enterprise" },
  { id: "su2", name: "Marcus Lee", company: "Solace Health", time: "48m ago", av: "ML", avBg: "linear-gradient(135deg,#33d493,#56a8ff)", plan: "Growth" },
  { id: "su3", name: "Ines Duarte", company: "Vertex Logistics", time: "2h ago", av: "ID", avBg: "linear-gradient(135deg,#f7b84e,#f76d7d)", plan: "Starter" },
  { id: "su4", name: "Tariq Amin", company: "Bright Path Media", time: "4h ago", av: "TA", avBg: "linear-gradient(135deg,#9d86ff,#7c5cff)", plan: "Growth" },
  { id: "su5", name: "Sofia Rossi", company: "Cobalt Systems", time: "6h ago", av: "SR", avBg: "linear-gradient(135deg,#56a8ff,#33d493)", plan: "Enterprise" },
  { id: "su6", name: "Owen Baxter", company: "Delta Freight", time: "9h ago", av: "OB", avBg: "linear-gradient(135deg,#f76d7d,#9d86ff)", plan: "Starter" },
];

// ---------------------------------------------------------------------------
// Business intelligence dashboard
// ---------------------------------------------------------------------------

export const biKpis: KpiCard[] = [
  { id: "bi1", label: "Revenue growth", value: "+18.4%", icon: "trending", tint: "acc", delta: { value: "2.1%", positive: true }, sub: "vs. previous quarter" },
  { id: "bi2", label: "Customer satisfaction", value: "4.6 / 5", icon: "check", tint: "ok", delta: { value: "0.2", positive: true }, sub: "NPS-weighted score" },
  { id: "bi3", label: "Data accuracy", value: "99.2%", icon: "database", tint: "info", delta: { value: "0.4%", positive: true }, sub: "Validated pipelines" },
  { id: "bi4", label: "Report adoption", value: "76%", icon: "bar", tint: "warn", delta: { value: "3.5%", positive: false }, sub: "Weekly active viewers" },
];

export const biInsights = [
  { id: "bi-in1", icon: "zap" as IconKey, tint: "acc" as TintKey, text: "Revenue in the West region is outpacing forecast by 22% — consider reallocating ad spend.", time: "Updated 2h ago" },
  { id: "bi-in2", icon: "alert" as IconKey, tint: "warn" as TintKey, text: "Support ticket volume for the Growth plan rose 14% week-over-week.", time: "Updated 5h ago" },
  { id: "bi-in3", icon: "trending" as IconKey, tint: "ok" as TintKey, text: "Trial-to-paid conversion improved after the new onboarding flow shipped.", time: "Updated 1d ago" },
];

export interface BiMetricRow {
  id: string;
  metric: string;
  current: string;
  target: string;
  pct: number;
  barColor: string;
  trend: string;
  trendPositive: boolean;
}

export const biMetrics: BiMetricRow[] = [
  { id: "bm1", metric: "Quarterly revenue", current: "$1.42M", target: "$1.60M", pct: 89, barColor: "var(--acc)", trend: "+4.2%", trendPositive: true },
  { id: "bm2", metric: "New customers", current: "612", target: "700", pct: 87, barColor: "var(--ok)", trend: "+6.8%", trendPositive: true },
  { id: "bm3", metric: "Gross margin", current: "68%", target: "72%", pct: 94, barColor: "var(--info)", trend: "+1.1%", trendPositive: true },
  { id: "bm4", metric: "Support CSAT", current: "91%", target: "95%", pct: 96, barColor: "var(--ok)", trend: "-0.4%", trendPositive: false },
  { id: "bm5", metric: "Churn rate", current: "2.1%", target: "1.8%", pct: 66, barColor: "var(--warn)", trend: "+0.3%", trendPositive: false },
  { id: "bm6", metric: "Marketing ROI", current: "3.6x", target: "4.0x", pct: 90, barColor: "var(--acc)", trend: "+0.2x", trendPositive: true },
];

export const biSources = [
  { name: "Product analytics", records: "2.4M records", time: "4 min ago", icon: "database" as IconKey, tint: "acc" as TintKey, status: "Synced", dot: "var(--ok)" },
  { name: "CRM (Salesforce)", records: "180k records", time: "12 min ago", icon: "layers" as IconKey, tint: "info" as TintKey, status: "Synced", dot: "var(--ok)" },
  { name: "Billing (Stripe)", records: "64k records", time: "1 hr ago", icon: "card" as IconKey, tint: "ok" as TintKey, status: "Synced", dot: "var(--ok)" },
  { name: "Support desk", records: "38k records", time: "3 hr ago", icon: "file" as IconKey, tint: "warn" as TintKey, status: "Delayed", dot: "var(--warn)" },
];

export interface BiReportRow {
  id: string;
  name: string;
  type: string;
  icon: IconKey;
  tint: TintKey;
  owner: string;
  updated: string;
  views: string;
}

export const biReports: BiReportRow[] = [
  { id: "r1", name: "Quarterly business review", type: "Executive deck", icon: "bar", tint: "acc", owner: "Maya Chen", updated: "2 days ago", views: "1,204" },
  { id: "r2", name: "Customer health scorecard", type: "Dashboard", icon: "pie", tint: "ok", owner: "Diego Ruiz", updated: "5 days ago", views: "864" },
  { id: "r3", name: "Marketing funnel analysis", type: "Report", icon: "trending", tint: "info", owner: "Priya Nair", updated: "1 week ago", views: "742" },
  { id: "r4", name: "Regional revenue breakdown", type: "Dashboard", icon: "globe", tint: "warn", owner: "Sam Okafor", updated: "1 week ago", views: "588" },
  { id: "r5", name: "Support SLA compliance", type: "Report", icon: "check", tint: "bad", owner: "Nora Kim", updated: "2 weeks ago", views: "410" },
];

export const biRegions = [
  { name: "North America", value: "$612k", pct: 42, color: "var(--acc)" },
  { name: "Europe", value: "$398k", pct: 27, color: "var(--info)" },
  { name: "Asia Pacific", value: "$268k", pct: 18, color: "var(--ok)" },
  { name: "Latin America", value: "$96k", pct: 7, color: "var(--warn)" },
  { name: "Middle East", value: "$64k", pct: 4, color: "var(--bad)" },
  { name: "Africa", value: "$32k", pct: 2, color: "var(--t2)" },
];
