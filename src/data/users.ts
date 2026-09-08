export interface UserPermissionTag {
  name: string;
  granted: boolean;
}

export interface UserSession {
  device: string;
  location: string;
  time: string;
  current: boolean;
}

export interface UserRecord {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  jobTitle: string;
  role: string;
  department: string;
  location: string;
  status: string;
  joined: string;
  lastActive: string;
  reportsTo: string;
  twoFactor: boolean;
  bio: string;
}

export const users: UserRecord[] = [
  {
    id: "usr_8kd92mq",
    firstName: "Marcus",
    lastName: "Liu",
    name: "Marcus Liu",
    email: "marcus@vela.io",
    phone: "+1 (512) 555-0147",
    jobTitle: "Sales Manager",
    role: "Manager",
    department: "Sales",
    location: "Austin, TX",
    status: "Active",
    joined: "Feb 2024",
    lastActive: "2 min ago",
    reportsTo: "Elena Park — VP Sales",
    twoFactor: true,
    bio: "Leads the Austin sales pod, focused on mid-market renewals and expansion.",
  },
  {
    id: "usr_2p91xrt",
    firstName: "Elena",
    lastName: "Park",
    name: "Elena Park",
    email: "elena@vela.io",
    phone: "+1 (415) 555-0132",
    jobTitle: "VP of Sales",
    role: "Admin",
    department: "Sales",
    location: "San Francisco, CA",
    status: "Active",
    joined: "Jan 2024",
    lastActive: "Just now",
    reportsTo: "Dana Keller — CEO",
    twoFactor: true,
    bio: "Experienced sales leader with 12+ years driving enterprise growth. Currently leading the West Coast enterprise team at Stripe. Passionate about building high-performing teams and data-driven sales strategies.",
  },
  {
    id: "usr_7j3lwzn",
    firstName: "David",
    lastName: "Stone",
    name: "David Stone",
    email: "david@vela.io",
    phone: "+1 (206) 555-0198",
    jobTitle: "CTO",
    role: "Admin",
    department: "Engineering",
    location: "Seattle, WA",
    status: "Active",
    joined: "Nov 2023",
    lastActive: "10 min ago",
    reportsTo: "Dana Keller — CEO",
    twoFactor: true,
    bio: "Oversees platform architecture and the engineering roadmap across all product lines.",
  },
  {
    id: "usr_5m0qbek",
    firstName: "Priya",
    lastName: "Nair",
    name: "Priya Nair",
    email: "priya@vela.io",
    phone: "+1 (312) 555-0173",
    jobTitle: "Senior Product Designer",
    role: "Editor",
    department: "Design",
    location: "Chicago, IL",
    status: "Active",
    joined: "Mar 2024",
    lastActive: "1 hr ago",
    reportsTo: "David Stone — CTO",
    twoFactor: false,
    bio: "Designs core product flows with a focus on accessibility and design-system consistency.",
  },
  {
    id: "usr_9c4vhda",
    firstName: "Omar",
    lastName: "Haddad",
    name: "Omar Haddad",
    email: "omar@vela.io",
    phone: "+1 (646) 555-0116",
    jobTitle: "Backend Engineer",
    role: "Editor",
    department: "Engineering",
    location: "New York, NY",
    status: "Active",
    joined: "Jun 2024",
    lastActive: "35 min ago",
    reportsTo: "David Stone — CTO",
    twoFactor: true,
    bio: "Builds and maintains billing and payments infrastructure.",
  },
  {
    id: "usr_3k8ftsu",
    firstName: "Sofia",
    lastName: "Rossi",
    name: "Sofia Rossi",
    email: "sofia@vela.io",
    phone: "+1 (720) 555-0184",
    jobTitle: "Marketing Lead",
    role: "Manager",
    department: "Marketing",
    location: "Denver, CO",
    status: "Invited",
    joined: "Jul 2026",
    lastActive: "Never",
    reportsTo: "Elena Park — VP Sales",
    twoFactor: false,
    bio: "Runs demand-gen campaigns and lifecycle email programs.",
  },
  {
    id: "usr_6r7ynig",
    firstName: "Liam",
    lastName: "Foster",
    name: "Liam Foster",
    email: "liam@vela.io",
    phone: "+1 (503) 555-0159",
    jobTitle: "Support Specialist",
    role: "Viewer",
    department: "Support",
    location: "Portland, OR",
    status: "Active",
    joined: "Sep 2024",
    lastActive: "3 hr ago",
    reportsTo: "Marcus Liu — Sales Manager",
    twoFactor: false,
    bio: "Handles tier-1 support tickets and customer onboarding calls.",
  },
  {
    id: "usr_1a5wcpx",
    firstName: "Grace",
    lastName: "Kim",
    name: "Grace Kim",
    email: "grace@vela.io",
    phone: "+1 (617) 555-0142",
    jobTitle: "Finance Analyst",
    role: "Viewer",
    department: "Finance",
    location: "Boston, MA",
    status: "Suspended",
    joined: "Apr 2024",
    lastActive: "12 days ago",
    reportsTo: "Dana Keller — CEO",
    twoFactor: true,
    bio: "Manages budgeting and vendor spend reviews across departments.",
  },
];

export const userStats = [
  { label: "Total members", value: "142", delta: "+8%", positive: true, icon: "👥", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
  { label: "Active now", value: "38", delta: "+4%", positive: true, icon: "🟢", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { label: "Pending invites", value: "6", delta: "-2%", positive: false, icon: "✉️", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
  { label: "Admins", value: "9", delta: "+1%", positive: true, icon: "🛡️", tint: "var(--info)", tintBg: "var(--info-soft)" },
];

export const myProfile = {
  ...users[1],
  title: "VP of Sales · San Francisco · Joined Jan 2024",
  stats: [
    { label: "Deals closed", value: "84", color: "var(--acc)" },
    { label: "Revenue booked", value: "$2.4M", color: "var(--ok)" },
    { label: "Team size", value: "12", color: "var(--info)" },
    { label: "Win rate", value: "62%", color: "var(--warn)" },
  ],
};

export const userContactInfo = [
  { icon: "✉️", label: "Email", value: "elena@vela.io" },
  { icon: "📞", label: "Phone", value: "+1 (415) 555-0132" },
  { icon: "📍", label: "Location", value: "San Francisco, CA" },
  { icon: "🏢", label: "Department", value: "Sales" },
];

export const userActivity = [
  { icon: "✅", tint: "var(--ok)", tintBg: "var(--ok-soft)", text: "Closed the Acme Co. renewal", time: "2 hours ago" },
  { icon: "👥", tint: "var(--acc)", tintBg: "var(--acc-soft)", text: "Added 3 new members to the Sales team", time: "Yesterday" },
  { icon: "📝", tint: "var(--info)", tintBg: "var(--info-soft)", text: "Updated the Q3 forecast document", time: "2 days ago" },
  { icon: "🔑", tint: "var(--warn)", tintBg: "var(--warn-soft)", text: "Changed account permissions for Liam Foster", time: "3 days ago" },
];

export const userDetailStats = [
  { label: "Deals", value: "34", color: "var(--acc)" },
  { label: "Tasks", value: "128", color: "var(--info)" },
  { label: "Logins (30d)", value: "56", color: "var(--ok)" },
];

export const userPermTags: UserPermissionTag[] = [
  { name: "View reports", granted: true },
  { name: "Edit deals", granted: true },
  { name: "Manage team", granted: true },
  { name: "Billing access", granted: false },
  { name: "Admin settings", granted: false },
  { name: "Export data", granted: true },
];

export const userSessions: UserSession[] = [
  { device: "MacBook Pro · Chrome", location: "Austin, TX", time: "Active now", current: true },
  { device: "iPhone 15 · Safari", location: "Austin, TX", time: "3 hours ago", current: false },
  { device: "Windows PC · Edge", location: "Dallas, TX", time: "2 days ago", current: false },
];

export interface RoleRecord {
  id: string;
  name: string;
  desc: string;
  usersCount: number;
  avatars: string[];
  icon: string;
  tint: string;
  tintBg: string;
}

export const roles: RoleRecord[] = [
  {
    id: "admin",
    name: "Admin",
    desc: "Full access to every workspace setting, billing, and user management tool.",
    usersCount: 9,
    avatars: ["Elena Park", "David Stone", "Dana Keller"],
    icon: "🛡️",
    tint: "var(--acc)",
    tintBg: "var(--acc-soft)",
  },
  {
    id: "manager",
    name: "Manager",
    desc: "Manages a team, approves changes, and views team-level reporting.",
    usersCount: 24,
    avatars: ["Marcus Liu", "Sofia Rossi", "Priya Nair"],
    icon: "📋",
    tint: "var(--info)",
    tintBg: "var(--info-soft)",
  },
  {
    id: "editor",
    name: "Editor",
    desc: "Can create and edit records but can't manage users or billing.",
    usersCount: 58,
    avatars: ["Omar Haddad", "Priya Nair", "Liam Foster"],
    icon: "✏️",
    tint: "var(--ok)",
    tintBg: "var(--ok-soft)",
  },
  {
    id: "viewer",
    name: "Viewer",
    desc: "Read-only access to dashboards, reports, and shared documents.",
    usersCount: 41,
    avatars: ["Liam Foster", "Grace Kim"],
    icon: "👁️",
    tint: "var(--t1)",
    tintBg: "var(--bg-3)",
  },
  {
    id: "support",
    name: "Support agent",
    desc: "Handles tickets and can view customer account details.",
    usersCount: 7,
    avatars: ["Liam Foster"],
    icon: "🎧",
    tint: "var(--warn)",
    tintBg: "var(--warn-soft)",
  },
  {
    id: "finance",
    name: "Finance",
    desc: "Access to invoices, payouts, and financial reporting only.",
    usersCount: 3,
    avatars: ["Grace Kim"],
    icon: "💰",
    tint: "var(--bad)",
    tintBg: "var(--bad-soft)",
  },
];

export interface PermissionRow {
  name: string;
  desc: string;
  admin: boolean;
  manager: boolean;
  editor: boolean;
  viewer: boolean;
}

export const permissionMatrix: PermissionRow[] = [
  { name: "View dashboard", desc: "See workspace-wide analytics and KPIs", admin: true, manager: true, editor: true, viewer: true },
  { name: "Manage users", desc: "Invite, edit, and deactivate members", admin: true, manager: true, editor: false, viewer: false },
  { name: "Edit projects", desc: "Create and modify projects and tasks", admin: true, manager: true, editor: true, viewer: false },
  { name: "Delete records", desc: "Permanently remove data from the workspace", admin: true, manager: false, editor: false, viewer: false },
  { name: "Manage billing", desc: "View invoices and update payment methods", admin: true, manager: false, editor: false, viewer: false },
  { name: "Export data", desc: "Download reports and raw data exports", admin: true, manager: true, editor: true, viewer: false },
  { name: "Manage integrations", desc: "Connect and configure third-party apps", admin: true, manager: false, editor: false, viewer: false },
  { name: "View reports", desc: "Access shared reports and dashboards", admin: true, manager: true, editor: true, viewer: true },
];

export interface TeamRecord {
  id: string;
  name: string;
  lead: string;
  members: string[];
  count: number;
  projects: number;
  active: number;
  emoji: string;
  tint: string;
  tintBg: string;
}

export const teams: TeamRecord[] = [
  { id: "sales", name: "Sales", lead: "Elena Park", members: ["Marcus Liu", "Elena Park", "Sofia Rossi", "Grace Kim"], count: 24, projects: 6, active: 12, emoji: "💼", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
  { id: "engineering", name: "Engineering", lead: "David Stone", members: ["David Stone", "Omar Haddad", "Priya Nair", "Liam Foster"], count: 38, projects: 9, active: 21, emoji: "🛠️", tint: "var(--info)", tintBg: "var(--info-soft)" },
  { id: "design", name: "Design", lead: "Priya Nair", members: ["Priya Nair", "Sofia Rossi"], count: 12, projects: 4, active: 6, emoji: "🎨", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
  { id: "marketing", name: "Marketing", lead: "Sofia Rossi", members: ["Sofia Rossi", "Grace Kim", "Liam Foster"], count: 16, projects: 5, active: 8, emoji: "📣", tint: "var(--bad)", tintBg: "var(--bad-soft)" },
  { id: "support", name: "Support", lead: "Liam Foster", members: ["Liam Foster", "Omar Haddad"], count: 20, projects: 3, active: 14, emoji: "🎧", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { id: "finance", name: "Finance", lead: "Grace Kim", members: ["Grace Kim", "Dana Keller"], count: 8, projects: 2, active: 3, emoji: "💰", tint: "var(--acc-2)", tintBg: "var(--acc-soft)" },
];

export interface DepartmentRecord {
  id: string;
  name: string;
  teams: number;
  head: string;
  members: number;
  budget: string;
  status: string;
  emoji: string;
  tint: string;
  tintBg: string;
}

export const departments: DepartmentRecord[] = [
  { id: "sales", name: "Sales", teams: 3, head: "Elena Park", members: 42, budget: "$1.2M", status: "Active", emoji: "💼", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
  { id: "engineering", name: "Engineering", teams: 4, head: "David Stone", members: 58, budget: "$3.4M", status: "Active", emoji: "🛠️", tint: "var(--info)", tintBg: "var(--info-soft)" },
  { id: "design", name: "Design", teams: 1, head: "Priya Nair", members: 12, budget: "$620K", status: "Active", emoji: "🎨", tint: "var(--warn)", tintBg: "var(--warn-soft)" },
  { id: "marketing", name: "Marketing", teams: 2, head: "Sofia Rossi", members: 16, budget: "$980K", status: "Active", emoji: "📣", tint: "var(--bad)", tintBg: "var(--bad-soft)" },
  { id: "support", name: "Support", teams: 1, head: "Liam Foster", members: 20, budget: "$540K", status: "Active", emoji: "🎧", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { id: "finance", name: "Finance", teams: 1, head: "Grace Kim", members: 8, budget: "$410K", status: "Active", emoji: "💰", tint: "var(--acc-2)", tintBg: "var(--acc-soft)" },
];

export interface ActivityLogEntry {
  id: string;
  user: string;
  action: string;
  time: string;
  type: string;
  ip: string;
  tint: string;
  tintBg: string;
  icon: string;
}

export const activityLogs: ActivityLogEntry[] = [
  { id: "log_1", user: "Elena Park", action: "signed in from a new device", time: "2 min ago", type: "Login", ip: "104.28.11.2", tint: "var(--ok)", tintBg: "var(--ok-soft)", icon: "🔑" },
  { id: "log_2", user: "Marcus Liu", action: "updated the Sales pipeline permissions", time: "18 min ago", type: "Changes", ip: "76.14.90.5", tint: "var(--info)", tintBg: "var(--info-soft)", icon: "⚙️" },
  { id: "log_3", user: "David Stone", action: "deleted the staging integration key", time: "1 hr ago", type: "Deletions", ip: "45.9.201.6", tint: "var(--bad)", tintBg: "var(--bad-soft)", icon: "🗑️" },
  { id: "log_4", user: "Priya Nair", action: "invited sofia@vela.io to the workspace", time: "3 hr ago", type: "Changes", ip: "88.201.4.10", tint: "var(--acc)", tintBg: "var(--acc-soft)", icon: "✉️" },
  { id: "log_5", user: "Omar Haddad", action: "signed in from Chrome on Windows", time: "5 hr ago", type: "Login", ip: "12.44.90.121", tint: "var(--ok)", tintBg: "var(--ok-soft)", icon: "🔑" },
  { id: "log_6", user: "Grace Kim", action: "exported the Q2 financial report", time: "Yesterday", type: "Changes", ip: "203.0.113.5", tint: "var(--warn)", tintBg: "var(--warn-soft)", icon: "📤" },
  { id: "log_7", user: "Sofia Rossi", action: "removed the archived campaign board", time: "2 days ago", type: "Deletions", ip: "192.0.2.19", tint: "var(--bad)", tintBg: "var(--bad-soft)", icon: "🗑️" },
  { id: "log_8", user: "Liam Foster", action: "changed their password", time: "3 days ago", type: "Changes", ip: "198.51.100.7", tint: "var(--info)", tintBg: "var(--info-soft)", icon: "⚙️" },
];
