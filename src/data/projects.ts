import type { StatusVariant } from "@/lib/status";

export interface ProjectMilestone {
  name: string;
  tasks: string;
  date: string;
  pct: number;
  done: boolean;
}

export interface ProjectActivityEntry {
  who: string;
  text: string;
  time: string;
  icon: string;
  tint: string;
  tintBg: string;
}

export interface ProjectWorkloadEntry {
  name: string;
  tasks: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  client: string;
  emoji: string;
  status: string;
  desc: string;
  pct: number;
  team: string[];
  tasksCount: number;
  due: string;
  dueTone: "ok" | "warn" | "bad";
  startDate: string;
  dueDate: string;
  budget: string;
  spent: string;
  priority: string;
  milestones: ProjectMilestone[];
  activity: ProjectActivityEntry[];
  workload: ProjectWorkloadEntry[];
}

export const projects: ProjectRecord[] = [
  {
    id: "proj_billing",
    name: "Billing Platform v2",
    client: "Internal — Finance",
    emoji: "💳",
    status: "On track",
    desc: "Complete rebuild of the billing engine with usage-based pricing, invoicing automation, and Stripe integration. Target launch: end of Q3.",
    pct: 68,
    team: ["David Stone", "Omar Haddad", "Elena Park"],
    tasksCount: 42,
    due: "Due Jun 30",
    dueTone: "warn",
    startDate: "2026-04-14",
    dueDate: "2026-06-30",
    budget: "$84,000",
    spent: "$61,200 (73%)",
    priority: "High",
    milestones: [
      { name: "Metering pipeline", tasks: "12", date: "Apr 28", pct: 100, done: true },
      { name: "Tier pricing engine", tasks: "9", date: "May 12", pct: 100, done: true },
      { name: "Invoice automation", tasks: "14", date: "May 30", pct: 100, done: true },
      { name: "Stripe integration", tasks: "10", date: "Jun 18", pct: 55, done: false },
      { name: "Migration & rollout", tasks: "7", date: "Jun 30", pct: 0, done: false },
    ],
    activity: [
      { who: "David Stone", text: "merged the metering pipeline into main", time: "2 hr ago", icon: "🔀", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
      { who: "Omar Haddad", text: "closed TASK-284", time: "5 hr ago", icon: "✅", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
      { who: "Elena Park", text: "updated the project budget", time: "Yesterday", icon: "💰", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
      { who: "David Stone", text: "commented on TASK-271", time: "2 days ago", icon: "💬", tint: "var(--info)", tintBg: "var(--info-soft)" },
    ],
    workload: [
      { name: "David Stone", tasks: "14 tasks" },
      { name: "Omar Haddad", tasks: "11 tasks" },
      { name: "Elena Park", tasks: "6 tasks" },
    ],
  },
  {
    id: "proj_mobile",
    name: "Mobile App Redesign",
    client: "Internal — Product",
    emoji: "📱",
    status: "At risk",
    desc: "Full visual and UX overhaul of the mobile app, moving to the new design system with a focus on onboarding and retention.",
    pct: 41,
    team: ["Priya Nair", "Sofia Rossi", "Liam Foster"],
    tasksCount: 36,
    due: "Due Jul 15",
    dueTone: "bad",
    startDate: "2026-03-02",
    dueDate: "2026-07-15",
    budget: "$56,000",
    spent: "$38,900 (69%)",
    priority: "High",
    milestones: [
      { name: "Design system audit", tasks: "6", date: "Mar 20", pct: 100, done: true },
      { name: "Onboarding flow", tasks: "10", date: "Apr 25", pct: 100, done: true },
      { name: "Navigation redesign", tasks: "8", date: "May 30", pct: 40, done: false },
      { name: "Dark mode support", tasks: "6", date: "Jun 20", pct: 0, done: false },
      { name: "QA & rollout", tasks: "6", date: "Jul 15", pct: 0, done: false },
    ],
    activity: [
      { who: "Priya Nair", text: "uploaded new onboarding mockups", time: "1 hr ago", icon: "🎨", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
      { who: "Sofia Rossi", text: "flagged a blocker on navigation redesign", time: "4 hr ago", icon: "⚠️", tint: "var(--bad)", tintBg: "var(--bad-soft)" },
      { who: "Liam Foster", text: "closed 3 QA tickets", time: "Yesterday", icon: "✅", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
    ],
    workload: [
      { name: "Priya Nair", tasks: "13 tasks" },
      { name: "Sofia Rossi", tasks: "9 tasks" },
      { name: "Liam Foster", tasks: "8 tasks" },
    ],
  },
  {
    id: "proj_marketing_site",
    name: "Marketing Site Refresh",
    client: "Acme Co.",
    emoji: "🌐",
    status: "On track",
    desc: "New landing pages, pricing page, and blog redesign to support the Q3 product launch campaign.",
    pct: 82,
    team: ["Sofia Rossi", "Grace Kim"],
    tasksCount: 24,
    due: "Due Jun 10",
    dueTone: "ok",
    startDate: "2026-05-01",
    dueDate: "2026-06-10",
    budget: "$32,000",
    spent: "$21,000 (66%)",
    priority: "Medium",
    milestones: [
      { name: "Landing pages", tasks: "8", date: "May 15", pct: 100, done: true },
      { name: "Pricing page", tasks: "4", date: "May 25", pct: 100, done: true },
      { name: "Blog redesign", tasks: "6", date: "Jun 5", pct: 70, done: false },
      { name: "Launch QA", tasks: "6", date: "Jun 10", pct: 20, done: false },
    ],
    activity: [
      { who: "Sofia Rossi", text: "published the new pricing page", time: "3 hr ago", icon: "🚀", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
      { who: "Grace Kim", text: "reviewed launch budget", time: "1 day ago", icon: "💰", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
    ],
    workload: [
      { name: "Sofia Rossi", tasks: "10 tasks" },
      { name: "Grace Kim", tasks: "6 tasks" },
    ],
  },
  {
    id: "proj_data_platform",
    name: "Data Platform Migration",
    client: "Internal — Engineering",
    emoji: "🗄️",
    status: "Planning",
    desc: "Migrate the analytics warehouse to a new pipeline with real-time streaming and lower query latency.",
    pct: 12,
    team: ["David Stone", "Omar Haddad"],
    tasksCount: 30,
    due: "Due Sep 1",
    dueTone: "ok",
    startDate: "2026-06-01",
    dueDate: "2026-09-01",
    budget: "$120,000",
    spent: "$9,600 (8%)",
    priority: "Medium",
    milestones: [
      { name: "Requirements & scoping", tasks: "5", date: "Jun 15", pct: 90, done: false },
      { name: "Pipeline architecture", tasks: "8", date: "Jul 10", pct: 0, done: false },
      { name: "Migration & cutover", tasks: "12", date: "Aug 20", pct: 0, done: false },
      { name: "Validation & sign-off", tasks: "5", date: "Sep 1", pct: 0, done: false },
    ],
    activity: [
      { who: "David Stone", text: "drafted the architecture proposal", time: "2 days ago", icon: "📝", tint: "var(--info)", tintBg: "var(--info-soft)" },
      { who: "Omar Haddad", text: "created the project kickoff doc", time: "4 days ago", icon: "📄", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
    ],
    workload: [
      { name: "David Stone", tasks: "5 tasks" },
      { name: "Omar Haddad", tasks: "4 tasks" },
    ],
  },
  {
    id: "proj_support_portal",
    name: "Support Portal Revamp",
    client: "Internal — Support",
    emoji: "🎧",
    status: "On track",
    desc: "Self-serve knowledge base and ticket portal redesign to reduce first-response time.",
    pct: 55,
    team: ["Liam Foster", "Priya Nair"],
    tasksCount: 20,
    due: "Due Jul 22",
    dueTone: "warn",
    startDate: "2026-05-10",
    dueDate: "2026-07-22",
    budget: "$28,000",
    spent: "$14,500 (52%)",
    priority: "Low",
    milestones: [
      { name: "Article taxonomy", tasks: "4", date: "May 20", pct: 100, done: true },
      { name: "Portal UI", tasks: "8", date: "Jun 25", pct: 60, done: false },
      { name: "Ticket flow rebuild", tasks: "8", date: "Jul 22", pct: 10, done: false },
    ],
    activity: [
      { who: "Liam Foster", text: "finalized the article taxonomy", time: "5 days ago", icon: "✅", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
      { who: "Priya Nair", text: "shared new portal wireframes", time: "1 week ago", icon: "🎨", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
    ],
    workload: [
      { name: "Liam Foster", tasks: "8 tasks" },
      { name: "Priya Nair", tasks: "5 tasks" },
    ],
  },
  {
    id: "proj_finance_automation",
    name: "Finance Automation",
    client: "Internal — Finance",
    emoji: "📊",
    status: "Completed",
    desc: "Automated monthly close workflows and reconciliation reporting for the finance team.",
    pct: 100,
    team: ["Grace Kim", "Dana Keller"],
    tasksCount: 18,
    due: "Completed May 2",
    dueTone: "ok",
    startDate: "2026-02-01",
    dueDate: "2026-05-02",
    budget: "$18,000",
    spent: "$17,400 (97%)",
    priority: "Low",
    milestones: [
      { name: "Workflow mapping", tasks: "4", date: "Feb 20", pct: 100, done: true },
      { name: "Automation build", tasks: "10", date: "Apr 10", pct: 100, done: true },
      { name: "Rollout & training", tasks: "4", date: "May 2", pct: 100, done: true },
    ],
    activity: [
      { who: "Grace Kim", text: "closed out the final rollout tasks", time: "2 months ago", icon: "🎉", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
    ],
    workload: [
      { name: "Grace Kim", tasks: "12 tasks" },
      { name: "Dana Keller", tasks: "6 tasks" },
    ],
  },
];

export const projDetailStatFields: { key: keyof ProjectRecord; label: string; color: string }[] = [
  { key: "pct", label: "Progress", color: "var(--acc)" },
  { key: "tasksCount", label: "Tasks", color: "var(--info)" },
  { key: "budget", label: "Budget", color: "var(--ok)" },
  { key: "spent", label: "Spent", color: "var(--warn)" },
  { key: "priority", label: "Priority", color: "var(--bad)" },
];

export interface TaskComment {
  name: string;
  time: string;
  text: string;
}

export interface TaskRecord {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  desc: string;
  status: string;
  priority: string;
  subtasks: { name: string; done: boolean }[];
  comments: TaskComment[];
  assignee: string;
  sprint: string;
  storyPoints: number;
  dueDate: string;
  created: string;
  labels: string[];
}

export const tasks: TaskRecord[] = [
  {
    id: "TASK-284",
    projectId: "proj_billing",
    projectName: "Billing Platform v2",
    title: "Implement usage-based billing calculation engine",
    desc: "Build the core metering pipeline that aggregates usage events, applies tier pricing rules, and generates line items for the monthly invoice run. Must handle proration, mid-cycle plan changes, and usage caps.",
    status: "In progress",
    priority: "High priority",
    subtasks: [
      { name: "Design event aggregation schema", done: true },
      { name: "Implement tier pricing rules engine", done: true },
      { name: "Handle proration for plan changes", done: true },
      { name: "Add usage cap enforcement", done: false },
      { name: "Write integration tests", done: false },
    ],
    comments: [
      { name: "David Stone", time: "2 hr ago", text: "Proration logic looks good — let's double check the mid-cycle downgrade case before merging." },
      { name: "Omar Haddad", time: "1 hr ago", text: "Added a fix for that in the latest commit, re-requesting review." },
      { name: "Elena Park", time: "30 min ago", text: "Any ETA on the usage cap enforcement piece? Finance is asking." },
    ],
    assignee: "David Stone",
    sprint: "Sprint 24",
    storyPoints: 8,
    dueDate: "Jun 28",
    created: "Jun 12",
    labels: ["backend", "billing", "sprint-24"],
  },
  {
    id: "TASK-271",
    projectId: "proj_billing",
    projectName: "Billing Platform v2",
    title: "Wire up Stripe webhook handlers for invoice events",
    desc: "Listen for invoice.paid, invoice.payment_failed, and invoice.finalized events and sync state back into the billing engine.",
    status: "In review",
    priority: "Medium priority",
    subtasks: [
      { name: "Set up webhook endpoint", done: true },
      { name: "Handle invoice.paid", done: true },
      { name: "Handle invoice.payment_failed", done: false },
    ],
    comments: [{ name: "Omar Haddad", time: "1 day ago", text: "Ready for review, staging webhook secret is in 1Password." }],
    assignee: "Omar Haddad",
    sprint: "Sprint 24",
    storyPoints: 5,
    dueDate: "Jun 24",
    created: "Jun 10",
    labels: ["backend", "billing"],
  },
  {
    id: "TASK-198",
    projectId: "proj_mobile",
    projectName: "Mobile App Redesign",
    title: "Redesign onboarding carousel for new users",
    desc: "Three-screen onboarding carousel introducing key features, matching the new design system tokens.",
    status: "In progress",
    priority: "High priority",
    subtasks: [
      { name: "Wireframe carousel screens", done: true },
      { name: "Build high-fidelity mockups", done: true },
      { name: "Prototype transitions", done: false },
    ],
    comments: [{ name: "Sofia Rossi", time: "3 hr ago", text: "Love the new illustration style, let's ship it." }],
    assignee: "Priya Nair",
    sprint: "Sprint 24",
    storyPoints: 5,
    dueDate: "Jun 30",
    created: "Jun 8",
    labels: ["design", "mobile"],
  },
];

export interface TimelineEntry {
  title: string;
  desc: string;
  date: string;
  status: string;
  team: string[];
  icon: string;
  tint: string;
  tintBg: string;
}

export const pmTimeline: TimelineEntry[] = [
  { title: "Metering pipeline shipped", desc: "Core usage-event aggregation pipeline deployed to production.", date: "Apr 28, 2026", status: "Completed", team: ["David Stone", "Omar Haddad"], icon: "🚀", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { title: "Design system audit complete", desc: "Full audit of mobile components against the new design system.", date: "Mar 20, 2026", status: "Completed", team: ["Priya Nair"], icon: "✅", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { title: "Invoice automation live", desc: "Automated monthly invoice generation rolled out to all customers.", date: "May 30, 2026", status: "Completed", team: ["Omar Haddad", "Elena Park"], icon: "🧾", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { title: "Stripe integration in progress", desc: "Webhook handlers and payment sync work underway.", date: "Jun 18, 2026", status: "In progress", team: ["David Stone", "Omar Haddad"], icon: "💳", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
  { title: "Navigation redesign at risk", desc: "Blocked on final IA decisions for the tab bar restructure.", date: "Jun 20, 2026", status: "At risk", team: ["Sofia Rossi"], icon: "⚠️", tint: "var(--bad)", tintBg: "var(--bad-soft)" },
  { title: "Billing migration & rollout", desc: "Final migration of legacy accounts to the new billing engine.", date: "Jun 30, 2026", status: "Planned", team: ["David Stone", "Elena Park"], icon: "🗂️", tint: "var(--t1)", tintBg: "var(--bg-3)" },
];

export interface TeamBoardMember {
  name: string;
  role: string;
  online: boolean;
  load: number;
  loadLabel: string;
  loadTone: "ok" | "warn" | "bad";
  current: { name: string; eta: string; tone: "ok" | "warn" | "bad" | "info" | "accent" }[];
}

export const teamBoardMembers: TeamBoardMember[] = [
  {
    name: "David Stone", role: "CTO", online: true, load: 92, loadLabel: "Overloaded", loadTone: "bad",
    current: [
      { name: "Stripe integration", eta: "2d left", tone: "accent" },
      { name: "Architecture review", eta: "5d left", tone: "info" },
    ],
  },
  {
    name: "Omar Haddad", role: "Backend Engineer", online: true, load: 74, loadLabel: "Busy", loadTone: "warn",
    current: [
      { name: "Webhook handlers", eta: "1d left", tone: "accent" },
      { name: "Usage cap logic", eta: "3d left", tone: "ok" },
    ],
  },
  {
    name: "Priya Nair", role: "Senior Product Designer", online: true, load: 58, loadLabel: "Balanced", loadTone: "ok",
    current: [
      { name: "Onboarding mockups", eta: "2d left", tone: "warn" },
      { name: "Portal wireframes", eta: "4d left", tone: "info" },
    ],
  },
  {
    name: "Sofia Rossi", role: "Marketing Lead", online: false, load: 45, loadLabel: "Light", loadTone: "ok",
    current: [{ name: "Pricing page copy", eta: "1d left", tone: "accent" }],
  },
  {
    name: "Liam Foster", role: "Support Specialist", online: true, load: 63, loadLabel: "Balanced", loadTone: "ok",
    current: [
      { name: "Ticket flow rebuild", eta: "6d left", tone: "info" },
      { name: "QA regression pass", eta: "2d left", tone: "warn" },
    ],
  },
  {
    name: "Grace Kim", role: "Finance Analyst", online: false, load: 30, loadLabel: "Light", loadTone: "ok",
    current: [{ name: "Budget reconciliation", eta: "3d left", tone: "ok" }],
  },
];

export interface SprintCard {
  id: string;
  title: string;
  tag: string;
  tagTone: StatusVariant;
  pts: number;
  av: string;
}

export interface SprintColumn {
  name: string;
  color: string;
  pts: number;
  cards: SprintCard[];
}

export const sprintCols: SprintColumn[] = [
  {
    name: "Backlog", color: "var(--t1)", pts: 8,
    cards: [
      { id: "TASK-301", title: "Add usage cap enforcement UI", tag: "billing", tagTone: "accent", pts: 3, av: "David Stone" },
      { id: "TASK-302", title: "Write integration tests for pricing engine", tag: "backend", tagTone: "info", pts: 5, av: "Omar Haddad" },
    ],
  },
  {
    name: "To do", color: "var(--t2)", pts: 8,
    cards: [
      { id: "TASK-295", title: "Design dark mode color tokens", tag: "design", tagTone: "warning", pts: 3, av: "Priya Nair" },
      { id: "TASK-296", title: "Set up webhook retry queue", tag: "backend", tagTone: "info", pts: 5, av: "Omar Haddad" },
    ],
  },
  {
    name: "In progress", color: "var(--acc)", pts: 16,
    cards: [
      { id: "TASK-284", title: "Implement usage-based billing calculation engine", tag: "billing", tagTone: "accent", pts: 8, av: "David Stone" },
      { id: "TASK-198", title: "Redesign onboarding carousel for new users", tag: "mobile", tagTone: "warning", pts: 5, av: "Priya Nair" },
      { id: "TASK-271", title: "Wire up Stripe webhook handlers", tag: "billing", tagTone: "accent", pts: 3, av: "Omar Haddad" },
    ],
  },
  {
    name: "Done", color: "var(--ok)", pts: 38,
    cards: [
      { id: "TASK-260", title: "Ship metering pipeline to production", tag: "backend", tagTone: "info", pts: 8, av: "David Stone" },
      { id: "TASK-255", title: "Finalize article taxonomy", tag: "support", tagTone: "success", pts: 3, av: "Liam Foster" },
    ],
  },
];

export const ganttWeeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];

export const ganttRows = [
  { label: "Requirements & scoping", start: 0, duration: 12, color: "var(--ok)", av: "David Stone" },
  { label: "Metering pipeline", start: 5, duration: 20, color: "var(--ok)", av: "Omar Haddad" },
  { label: "Tier pricing engine", start: 20, duration: 18, color: "var(--ok)", av: "David Stone" },
  { label: "Invoice automation", start: 35, duration: 20, color: "var(--acc)", av: "Elena Park" },
  { label: "Stripe integration", start: 55, duration: 22, color: "var(--acc)", av: "Omar Haddad" },
  { label: "Migration & rollout", start: 78, duration: 18, color: "var(--bg-3)", av: "David Stone" },
  { label: "QA & sign-off", start: 88, duration: 12, color: "var(--bg-3)", av: "Elena Park" },
];

export const pmAnalyticsKpis = [
  { label: "On-time delivery", value: "84%", color: "var(--ok)", sub: "+6% vs last quarter" },
  { label: "Avg. cycle time", value: "4.2d", color: "var(--acc)", sub: "-0.8d vs last quarter" },
  { label: "Active projects", value: "24", color: "var(--info)", sub: "6 due this month" },
  { label: "Overdue tasks", value: "11", color: "var(--bad)", sub: "+3 vs last week" },
];

export const projVelocity = [
  { sprint: "S17", planned: 52, done: 48 },
  { sprint: "S18", planned: 55, done: 50 },
  { sprint: "S19", planned: 58, done: 54 },
  { sprint: "S20", planned: 54, done: 56 },
  { sprint: "S21", planned: 60, done: 52 },
  { sprint: "S22", planned: 58, done: 58 },
  { sprint: "S23", planned: 62, done: 57 },
  { sprint: "S24", planned: 62, done: 38 },
];

export const pmTaskDist = [
  { name: "Backend", count: 96, color: "var(--acc)" },
  { name: "Frontend", count: 68, color: "var(--info)" },
  { name: "Design", count: 44, color: "var(--warn)" },
  { name: "QA", count: 40, color: "var(--ok)" },
];

export const pmHealth = [
  { name: "Billing Platform v2", emoji: "💳", pct: 68, budget: "73%", budgetTone: "warn", overdue: 2, velocity: "57 pts", health: "On track", healthTone: "success" },
  { name: "Mobile App Redesign", emoji: "📱", pct: 41, budget: "69%", budgetTone: "warn", overdue: 4, velocity: "38 pts", health: "At risk", healthTone: "danger" },
  { name: "Marketing Site Refresh", emoji: "🌐", pct: 82, budget: "66%", budgetTone: "ok", overdue: 0, velocity: "22 pts", health: "On track", healthTone: "success" },
  { name: "Data Platform Migration", emoji: "🗄️", pct: 12, budget: "8%", budgetTone: "ok", overdue: 0, velocity: "9 pts", health: "Planning", healthTone: "info" },
  { name: "Support Portal Revamp", emoji: "🎧", pct: 55, budget: "52%", budgetTone: "ok", overdue: 1, velocity: "18 pts", health: "On track", healthTone: "success" },
];

export interface KanbanCard {
  tag: string;
  tagTone: StatusVariant;
  title: string;
  due: string;
  comments: number;
  assignees: string[];
}

export interface KanbanColumnData {
  title: string;
  dot: string;
  cards: KanbanCard[];
}

export const kanban: KanbanColumnData[] = [
  {
    title: "Ideas", dot: "var(--t1)",
    cards: [
      { tag: "research", tagTone: "info", title: "Explore AI-assisted invoice categorization", due: "Jul 5", comments: 2, assignees: ["David Stone"] },
      { tag: "growth", tagTone: "accent", title: "Referral program for existing customers", due: "Jul 10", comments: 4, assignees: ["Sofia Rossi", "Elena Park"] },
    ],
  },
  {
    title: "Planned", dot: "var(--info)",
    cards: [
      { tag: "mobile", tagTone: "warning", title: "Dark mode rollout for mobile app", due: "Jul 15", comments: 3, assignees: ["Priya Nair"] },
      { tag: "backend", tagTone: "info", title: "Rate limiting for public API", due: "Jul 20", comments: 1, assignees: ["Omar Haddad"] },
    ],
  },
  {
    title: "In progress", dot: "var(--acc)",
    cards: [
      { tag: "billing", tagTone: "accent", title: "Stripe webhook sync for invoice events", due: "Jun 28", comments: 5, assignees: ["Omar Haddad", "David Stone"] },
      { tag: "design", tagTone: "warning", title: "Onboarding carousel redesign", due: "Jun 30", comments: 2, assignees: ["Priya Nair"] },
      { tag: "support", tagTone: "success", title: "Knowledge base article taxonomy", due: "Jul 2", comments: 1, assignees: ["Liam Foster"] },
    ],
  },
  {
    title: "Shipped", dot: "var(--ok)",
    cards: [
      { tag: "backend", tagTone: "info", title: "Usage metering pipeline", due: "Jun 15", comments: 8, assignees: ["David Stone", "Omar Haddad"] },
      { tag: "finance", tagTone: "neutral", title: "Automated monthly close workflow", due: "May 2", comments: 3, assignees: ["Grace Kim"] },
    ],
  },
];

export const kanbanTeamAvatars = ["Marcus Liu", "Elena Park", "David Stone", "Priya Nair"];
