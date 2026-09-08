/**
 * ========================================================
 * Template Name: Vela — React Admin Dashboard Template
 * Author: elsayedB
 * License: You must have a valid license purchased only from ThemeForest
 * ========================================================
 */

/**
 * Canonical route path manifest for the whole app. Every page (all ~147
 * views from the source prototype) has exactly one entry here. Pages,
 * Sidebar links, breadcrumbs, and "view details" buttons must all resolve
 * paths through this object rather than hardcoding strings, so the app
 * never grows two different URLs for the same destination.
 */
export const paths = {
  home: "/",

  /* ---------- Gestão de franquias (produto) ---------- */
  acesso: {
    entrar: "/entrar",
    recuperar: "/recuperar",
    redefinir: (token: string = ":token") => `/redefinir/${token}`,
    convite: (token: string = ":token") => `/convite/${token}`,
    instalar: "/instalar",
  },
  onboarding: "/onboarding",
  loja: "/loja",
  equipe: "/equipe",
  analise: "/analise",
  configuracoes: {
    root: "/configuracoes",
    metas: "/configuracoes/metas",
    desafios: "/configuracoes/desafios",
    colaboradores: "/configuracoes/colaboradores",
    turnos: "/configuracoes/turnos-e-tarefas",
    mensagens: "/configuracoes/mensagens",
    documentos: "/configuracoes/documentos",
    custos: "/configuracoes/custos",
    marca: "/configuracoes/marca",
    erp: "/configuracoes/erp",
    usuarios: "/configuracoes/usuarios",
  },
  vendedora: {
    minhaMeta: "/minha-meta",
    tarefas: "/tarefas",
    ranking: "/ranking",
  },
  perfil: "/perfil",
  /* ---------- Template Vela (referência) ---------- */

  dashboards: {
    analytics: "/dashboards/analytics",
    crm: "/crm/dashboard",
    ecommerce: "/ecommerce/dashboard",
    finance: "/finance/dashboard",
    sales: "/dashboards/sales",
    marketing: "/marketing",
    logistics: "/logistics/dashboard",
    projects: "/dashboards/projects",
    saas: "/dashboards/saas",
    bi: "/dashboards/bi",
  },

  users: {
    list: "/users",
    profile: "/users/profile",
    detail: (id: string | number = ":id") => `/users/${id}`,
    new: "/users/new",
    edit: (id: string | number = ":id") => `/users/${id}/edit`,
    roles: "/users/roles",
    permissions: "/users/permissions",
    teams: "/users/teams",
    departments: "/users/departments",
    activityLogs: "/users/activity-logs",
  },

  projects: {
    list: "/projects",
    detail: (id: string | number = ":id") => `/projects/${id}`,
    new: "/projects/new",
    edit: (id: string | number = ":id") => `/projects/${id}/edit`,
    task: (id: string | number = ":id") => `/projects/tasks/${id}`,
    timeline: "/projects/timeline",
    teamBoard: "/projects/team-board",
    sprintBoard: "/projects/sprint-board",
    gantt: "/projects/gantt",
    analytics: "/projects/analytics",
    kanban: "/projects/kanban",
  },

  orders: {
    overview: "/orders",
  },

  tables: {
    responsive: "/tables/responsive",
    filter: "/tables/filter",
    basic: "/tables/basic",
    data: "/tables/data",
    advanced: "/tables/advanced",
    editable: "/tables/editable",
  },

  forms: {
    elements: "/forms/elements",
    layouts: "/forms/layouts",
    validation: "/forms/validation",
    wizard: "/forms/wizard",
    fileUpload: "/forms/file-upload",
    richText: "/forms/rich-text-editor",
    datePickers: "/forms/date-pickers",
    select: "/forms/select-components",
    inputMasks: "/forms/input-masks",
  },

  charts: {
    apex: "/charts/apex-charts",
    chartjs: "/charts/chartjs",
    statistics: "/charts/statistics",
    kpi: "/charts/kpi-analytics",
    heatmaps: "/charts/heatmaps",
    revenue: "/charts/revenue-analytics",
    userAnalytics: "/charts/user-analytics",
  },

  pricing: "/pricing",

  apps: {
    chat: "/apps/chat",
    contacts: "/apps/contacts",
    contactDetail: (id: string | number = ":id") => `/apps/contacts/${id}`,
    fileManager: "/apps/file-manager",
    notes: "/apps/notes",
    taskManager: "/apps/task-manager",
    helpDesk: "/apps/help-desk",
    ticketDetail: (id: string | number = ":id") => `/apps/help-desk/${id}`,
    groupChat: "/apps/group-chat",
    supportTickets: "/apps/support-tickets",
    email: "/apps/email",
    calendar: "/apps/calendar",
  },

  ecommerce: {
    dashboard: "/ecommerce/dashboard",
    productGrid: "/products",
    productList: "/products/list",
    productDetail: (id: string | number = ":id") => `/products/${id}`,
    productNew: "/products/new",
    productEdit: (id: string | number = ":id") => `/products/${id}/edit`,
    categories: "/products/categories",
    ordersList: "/ecommerce/orders",
    orderDetail: (id: string | number = ":id") => `/ecommerce/orders/${id}`,
    orderNew: "/ecommerce/orders/new",
    customersList: "/ecommerce/customers",
    customerDetail: (id: string | number = ":id") => `/ecommerce/customers/${id}`,
    customerAnalytics: "/ecommerce/customer-analytics",
    reviews: "/ecommerce/reviews",
    inventory: "/ecommerce/inventory",
    coupons: "/ecommerce/coupons",
    wishlist: "/ecommerce/wishlist",
    promotions: "/ecommerce/promotions",
  },

  finance: {
    dashboard: "/finance/dashboard",
    transactions: "/finance/transactions",
    payments: "/finance/payments",
    expenses: "/finance/expenses",
    profitLoss: "/finance/profit-loss",
    budget: "/finance/budget",
    invoices: "/finance/invoices",
    invoiceDetail: (id: string | number = ":id") => `/finance/invoices/${id}`,
    invoiceNew: "/finance/invoices/new",
    invoiceEdit: (id: string | number = ":id") => `/finance/invoices/${id}/edit`,
    reports: "/finance/reports",
  },

  crm: {
    dashboard: "/crm/dashboard",
    app: "/crm/app",
    leads: "/crm/leads",
    leadDetail: (id: string | number = ":id") => `/crm/leads/${id}`,
    opportunities: "/crm/opportunities",
    customers: "/crm/customers",
    dealsPipeline: "/crm/deals-pipeline",
    salesFunnel: "/crm/sales-funnel",
    campaigns: "/crm/campaigns",
    customerJourney: "/crm/customer-journey",
  },

  hr: {
    employees: "/hr/employees",
    employeeDetail: (id: string | number = ":id") => `/hr/employees/${id}`,
    attendance: "/hr/attendance",
    leaveRequests: "/hr/leave-requests",
    payroll: "/hr/payroll",
    departments: "/hr/departments",
    recruitment: "/hr/recruitment",
    jobApplications: "/hr/job-applications",
  },

  logistics: {
    dashboard: "/logistics/dashboard",
    shipments: "/logistics/shipments",
    shipmentDetail: (id: string | number = ":id") => `/logistics/shipments/${id}`,
    deliveryTracking: "/logistics/delivery-tracking",
    fleet: "/logistics/fleet",
    warehouse: "/logistics/warehouse",
    routePlanning: "/logistics/route-planning",
  },

  components: {
    root: "/components",
    tab: (tab: string) => `/components/${tab}`,
  },

  account: {
    root: "/account",
    tab: (tab: string) => `/account/${tab}`,
  },

  marketing: {
    root: "/marketing",
    tab: (tab: string) => `/marketing/${tab}`,
  },

  reports: {
    root: "/reports",
    tab: (tab: string) => `/reports/${tab}`,
  },

  settings: {
    root: "/settings",
    tab: (tab: string) => `/settings/${tab}`,
  },

  utility: {
    faq: "/utility/faq",
    helpCenter: "/utility/help-center",
    knowledgeBase: "/utility/knowledge-base",
    documentation: "/utility/documentation",
    searchResults: "/utility/search-results",
    notifications: "/utility/notifications",
    activityFeed: "/utility/activity-feed",
  },

  misc: {
    widgetGallery: "/pages/widget-gallery",
    uiPlayground: "/pages/ui-playground",
    themeCustomizer: "/pages/theme-customizer",
    rtlPreview: "/pages/rtl-preview",
    starterKit: "/pages/starter-kit",
    changelog: "/pages/changelog",
    roadmap: "/pages/roadmap",
    releaseNotes: "/pages/release-notes",
  },

  auth: {
    login: "/auth/login",
    loginSplit: "/auth/login-split",
    register: "/auth/register",
    registerSplit: "/auth/register-split",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    twoFactor: "/auth/two-factor",
    lockScreen: "/auth/lock-screen",
    verifyEmail: "/auth/verify-email",
    sessionTimeout: "/auth/session-timeout",
    maintenance: "/auth/maintenance",
    error: (code: string | number = ":code") => `/error/${code}`,
    notFound: "/404",
  },
} as const;
