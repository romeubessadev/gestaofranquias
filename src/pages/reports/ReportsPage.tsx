import { useParams } from "react-router-dom";
import { Badge, Button, Card, CardHeader, CardTitle, PageHeader, TabNav, Checkbox } from "@/components/ui";
import { Select } from "@/components/ui";
import { AreaLineChart, BarChart } from "@/components/charts";
import { paths } from "@/router/paths";
import { CalendarIcon, DownloadIcon, MailIcon, FileTextIcon } from "@/pages/utility/icons";

const TABS = [
  { label: "Sales", to: paths.reports.tab("sales") },
  { label: "Revenue", to: paths.reports.tab("revenue") },
  { label: "Customer", to: paths.reports.tab("customer") },
  { label: "Project", to: paths.reports.tab("project") },
  { label: "Marketing", to: paths.reports.tab("marketing") },
  { label: "Custom", to: paths.reports.tab("custom") },
];

interface ReportConfig {
  title: string;
  kpis: Array<{ label: string; value: string; delta: string }>;
  trendDelta: string;
  bars: Array<{ label: string; value: number }>;
  cols: [string, string, string];
  rows: Array<{ emoji: string; name: string; v1: string; v2: string; change: string }>;
}

const REPORTS: Record<string, ReportConfig> = {
  sales: {
    title: "Sales Report",
    kpis: [
      { label: "Total sales", value: "$1.28M", delta: "+14.2%" },
      { label: "Units sold", value: "24,810", delta: "+8.6%" },
      { label: "Avg order value", value: "$186", delta: "+3.1%" },
      { label: "Win rate", value: "31.4%", delta: "-1.2%" },
    ],
    trendDelta: "+14.2% YoY",
    bars: [
      { label: "Jan", value: 142 },
      { label: "Feb", value: 158 },
      { label: "Mar", value: 171 },
      { label: "Apr", value: 165 },
      { label: "May", value: 189 },
      { label: "Jun", value: 204 },
      { label: "Jul", value: 218 },
    ],
    cols: ["Region", "This period", "Last period"],
    rows: [
      { emoji: "🇺🇸", name: "North America", v1: "$542K", v2: "$481K", change: "+12.7%" },
      { emoji: "🇪🇺", name: "Europe", v1: "$398K", v2: "$352K", change: "+13.1%" },
      { emoji: "🌏", name: "Asia Pacific", v1: "$214K", v2: "$196K", change: "+9.2%" },
      { emoji: "🌎", name: "Latin America", v1: "$86K", v2: "$91K", change: "-5.5%" },
      { emoji: "🌍", name: "Middle East & Africa", v1: "$40K", v2: "$34K", change: "+17.6%" },
    ],
  },
  revenue: {
    title: "Revenue Report",
    kpis: [
      { label: "Total revenue", value: "$2.84M", delta: "+18.4%" },
      { label: "Recurring (MRR)", value: "$412K", delta: "+6.2%" },
      { label: "Gross margin", value: "72.8%", delta: "+1.4%" },
      { label: "Churn", value: "2.1%", delta: "-0.3%" },
    ],
    trendDelta: "+18.4% YoY",
    bars: [
      { label: "Jan", value: 310 },
      { label: "Feb", value: 348 },
      { label: "Mar", value: 372 },
      { label: "Apr", value: 356 },
      { label: "May", value: 401 },
      { label: "Jun", value: 428 },
      { label: "Jul", value: 452 },
    ],
    cols: ["Product line", "Revenue", "Prev. period"],
    rows: [
      { emoji: "📊", name: "Analytics Suite", v1: "$1.12M", v2: "$948K", change: "+18.1%" },
      { emoji: "🔌", name: "API Platform", v1: "$684K", v2: "$602K", change: "+13.6%" },
      { emoji: "🧩", name: "Integrations", v1: "$512K", v2: "$438K", change: "+16.9%" },
      { emoji: "🎓", name: "Training & services", v1: "$318K", v2: "$344K", change: "-7.6%" },
      { emoji: "🛠️", name: "Support plans", v1: "$206K", v2: "$182K", change: "+13.2%" },
    ],
  },
  customer: {
    title: "Customer Report",
    kpis: [
      { label: "Total customers", value: "38,620", delta: "+11.8%" },
      { label: "New this period", value: "3,105", delta: "+22.4%" },
      { label: "Retention", value: "94.2%", delta: "+0.8%" },
      { label: "Avg NPS", value: "62", delta: "+4" },
    ],
    trendDelta: "+11.8% YoY",
    bars: [
      { label: "Jan", value: 280 },
      { label: "Feb", value: 315 },
      { label: "Mar", value: 342 },
      { label: "Apr", value: 361 },
      { label: "May", value: 398 },
      { label: "Jun", value: 421 },
      { label: "Jul", value: 445 },
    ],
    cols: ["Segment", "Customers", "Prev. period"],
    rows: [
      { emoji: "🏢", name: "Enterprise", v1: "1,240", v2: "1,102", change: "+12.5%" },
      { emoji: "🏬", name: "Mid-market", v1: "4,820", v2: "4,301", change: "+12.1%" },
      { emoji: "🏪", name: "SMB", v1: "18,410", v2: "16,882", change: "+9.1%" },
      { emoji: "🧑‍💻", name: "Self-serve", v1: "14,150", v2: "12,240", change: "+15.6%" },
    ],
  },
  project: {
    title: "Project Report",
    kpis: [
      { label: "Active projects", value: "48", delta: "+6" },
      { label: "On-time delivery", value: "87.4%", delta: "+3.2%" },
      { label: "Budget utilization", value: "92.1%", delta: "-1.8%" },
      { label: "Avg cycle time", value: "11.2d", delta: "-0.8d" },
    ],
    trendDelta: "+3.2% on-time",
    bars: [
      { label: "Jan", value: 32 },
      { label: "Feb", value: 36 },
      { label: "Mar", value: 41 },
      { label: "Apr", value: 38 },
      { label: "May", value: 44 },
      { label: "Jun", value: 46 },
      { label: "Jul", value: 48 },
    ],
    cols: ["Team", "Completed", "Prev. period"],
    rows: [
      { emoji: "🎨", name: "Design", v1: "24", v2: "19", change: "+26.3%" },
      { emoji: "⚙️", name: "Engineering", v1: "61", v2: "54", change: "+13.0%" },
      { emoji: "📣", name: "Marketing", v1: "18", v2: "21", change: "-14.3%" },
      { emoji: "🧪", name: "QA", v1: "37", v2: "33", change: "+12.1%" },
    ],
  },
  marketing: {
    title: "Marketing Report",
    kpis: [
      { label: "Ad spend", value: "$248K", delta: "+9.6%" },
      { label: "Leads generated", value: "18,420", delta: "+16.3%" },
      { label: "Cost per lead", value: "$13.46", delta: "-5.8%" },
      { label: "Avg ROAS", value: "4.6x", delta: "+0.4x" },
    ],
    trendDelta: "+16.3% YoY",
    bars: [
      { label: "Jan", value: 1900 },
      { label: "Feb", value: 2200 },
      { label: "Mar", value: 2450 },
      { label: "Apr", value: 2380 },
      { label: "May", value: 2710 },
      { label: "Jun", value: 2890 },
      { label: "Jul", value: 3050 },
    ],
    cols: ["Channel", "Leads", "Prev. period"],
    rows: [
      { emoji: "🔍", name: "Organic search", v1: "6,840", v2: "5,912", change: "+15.7%" },
      { emoji: "📱", name: "Paid social", v1: "4,610", v2: "4,088", change: "+12.8%" },
      { emoji: "✉️", name: "Email", v1: "3,320", v2: "2,841", change: "+16.9%" },
      { emoji: "🤝", name: "Referral", v1: "2,180", v2: "2,254", change: "-3.3%" },
      { emoji: "🌐", name: "Direct", v1: "1,470", v2: "1,305", change: "+12.6%" },
    ],
  },
};

export function ReportsPage() {
  const { tab = "sales" } = useParams<{ tab: string }>();
  const config = REPORTS[tab];
  const title = tab === "custom" ? "Custom Report" : (config?.title ?? "Reports");

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader crumbs={[{ label: "Reports" }, { label: title }]} title={title} />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<CalendarIcon size={14} />}>
            Jan – Jul 2026
          </Button>
          <Button variant="secondary" icon={<DownloadIcon size={14} />}>
            Export PDF
          </Button>
          <Button icon={<MailIcon size={14} />}>Schedule</Button>
        </div>
      </div>
      <TabNav items={TABS} />
      <div className="mt-6">{tab === "custom" ? <CustomReportBuilder /> : config ? <StandardReport config={config} /> : <StandardReport config={REPORTS.sales} />}</div>
    </div>
  );
}

function StandardReport({ config }: { config: ReportConfig }) {
  return (
    <div>
      <div className="mb-4.5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {config.kpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-2xl font-extrabold tabular-nums text-t0">{k.value}</p>
            <p className={`text-[11.5px] font-bold ${k.delta.startsWith("-") ? "text-bad" : "text-ok"}`}>
              {k.delta} <span className="font-medium text-t2">vs prev.</span>
            </p>
          </Card>
        ))}
      </div>
      <Card padding="lg" className="mb-4.5">
        <div className="mb-4.5 flex items-start justify-between">
          <div>
            <CardTitle>{config.title.replace(" Report", "")} trend</CardTitle>
            <p className="mt-1.5 text-[12.5px] text-t2">Monthly performance · Jan – Jul 2026</p>
          </div>
          <Badge variant="success">{config.trendDelta}</Badge>
        </div>
        <BarChart data={config.bars} height={200} />
      </Card>
      <Card padding="lg">
        <div className="mb-4 flex items-center justify-between">
          <CardTitle>Breakdown</CardTitle>
          <a href="#" className="text-[12.5px] font-bold text-acc">
            Full report
          </a>
        </div>
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-3 border-b border-line pb-3 text-[10.5px] font-bold uppercase tracking-wide text-t2">
          <span>{config.cols[0]}</span>
          <span className="text-right">{config.cols[1]}</span>
          <span className="text-right">{config.cols[2]}</span>
          <span className="text-right">Change</span>
        </div>
        {config.rows.map((r) => (
          <div key={r.name} className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-3 border-b border-line py-3 last:border-b-0 hover:bg-bg-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-bg-inset text-sm">{r.emoji}</span>
              <span className="text-[13px] font-bold text-t0">{r.name}</span>
            </div>
            <span className="text-right text-[13px] font-bold tabular-nums text-t0">{r.v1}</span>
            <span className="text-right text-[13px] font-bold tabular-nums text-t0">{r.v2}</span>
            <span className={`text-right text-[12.5px] font-bold ${r.change.startsWith("-") ? "text-bad" : "text-ok"}`}>{r.change}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

const SAVED_REPORTS = [
  { name: "Monthly revenue summary", schedule: "Runs monthly · emailed to 4 people", tint: "var(--acc)", tintBg: "var(--acc-soft)" },
  { name: "Weekly pipeline health", schedule: "Runs weekly · Mondays 9:00", tint: "var(--ok)", tintBg: "var(--ok-soft)" },
  { name: "Quarterly board pack", schedule: "Runs quarterly · exported as PDF", tint: "var(--info)", tintBg: "var(--info-soft)" },
];

function CustomReportBuilder() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr] lg:items-start">
      <Card padding="lg">
        <CardHeader>
          <CardTitle>Report builder</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-t2">Data source</label>
            <Select className="h-10">
              <option>Sales</option>
              <option>Revenue</option>
              <option>Customers</option>
              <option>Projects</option>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-t2">Metrics</label>
            <div className="flex flex-col gap-2">
              <Checkbox label="Total revenue" defaultChecked />
              <Checkbox label="Units sold" defaultChecked />
              <Checkbox label="Avg order value" />
              <Checkbox label="Conversion rate" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-t2">Group by</label>
            <Select className="h-10">
              <option>Month</option>
              <option>Week</option>
              <option>Region</option>
              <option>Product</option>
            </Select>
          </div>
          <Button fullWidth>Generate report</Button>
        </div>
      </Card>
      <Card padding="lg">
        <div className="mb-4.5 flex items-center justify-between">
          <CardTitle>Preview</CardTitle>
          <span className="text-[11.5px] text-t2">Revenue &amp; units · by month</span>
        </div>
        <AreaLineChart data={[170, 150, 120, 130, 80, 90, 55, 40]} height={220} />
        <div className="mt-3.5 flex flex-col gap-3">
          <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">Saved reports</p>
          {SAVED_REPORTS.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-xl bg-bg-inset px-3.5 py-3">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[10px]" style={{ background: r.tintBg, color: r.tint }}>
                <FileTextIcon size={16} />
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-bold text-t0">{r.name}</p>
                <p className="mt-0.5 text-[11px] text-t2">{r.schedule}</p>
              </div>
              <Button variant="outline" size="sm">
                Run
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
