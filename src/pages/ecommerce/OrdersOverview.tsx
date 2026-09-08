import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, DataTable, Pagination, StatCard, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { orders, type EcomOrder } from "@/data/ecommerce";
import { cn } from "@/lib/cn";
import { IconCart, IconDollar, IconClock, IconTruck, IconDownload, IconPlus, IconSearch } from "./icons";

const TABS = ["All", "Pending", "Processing", "Shipped", "Delivered"];
const PAGE_SIZE = 6;

export function OrdersOverview() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const avgOrder = totalRevenue / orders.length;

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesTab = tab === "All" || o.status === tab;
      const matchesQuery = query.trim() === "" || o.id.toLowerCase().includes(query.toLowerCase()) || o.customerName.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: DataTableColumn<EcomOrder>[] = [
    { key: "id", header: "Order", render: (o) => <span className="font-mono text-[12.5px] font-bold text-t1">{o.id}</span> },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: o.avatarBg }}>
            {o.customerName.split(" ").map((n) => n[0]).join("")}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold text-t0">{o.customerName}</p>
            <p className="truncate text-[11.5px] text-t2">{o.email}</p>
          </div>
        </div>
      ),
    },
    { key: "date", header: "Date", hideBelow: "md", render: (o) => <span className="text-[13px] text-t1">{o.date}</span> },
    { key: "items", header: "Items", hideBelow: "lg", render: (o) => <span className="text-[13px] font-semibold text-t1">{o.itemCount}</span> },
    { key: "total", header: "Total", align: "right", render: (o) => <span className="font-mono text-[13px] font-bold text-t0">${o.total.toFixed(2)}</span> },
    { key: "status", header: "Status", render: (o) => <Badge status={o.status}>{o.status}</Badge> },
  ];

  return (
    <div>
      <PageHeaderLocal />
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total orders" value={orders.length} icon={<IconCart />} delta={{ value: "+12.4%", positive: true }} />
        <StatCard label="Pending fulfilment" value={pendingCount} icon={<IconClock />} iconColor="var(--warn)" iconBg="var(--warn-soft)" delta={{ value: "-3.1%", positive: false }} />
        <StatCard label="Revenue" value={`$${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} icon={<IconDollar />} iconColor="var(--ok)" iconBg="var(--ok-soft)" delta={{ value: "+8.9%", positive: true }} />
        <StatCard label="Avg. order value" value={`$${avgOrder.toFixed(0)}`} icon={<IconTruck />} iconColor="var(--info)" iconBg="var(--info-soft)" delta={{ value: "+2.2%", positive: true }} />
      </div>

      <div className="rounded-[var(--radius-vela-lg)] border border-line bg-bg-2 shadow-[var(--shadow-vela)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex max-w-full gap-1 overflow-x-auto rounded-[var(--radius-vela-md)] border border-line bg-bg-inset p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setPage(1);
                }}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] px-3 py-1.5 text-[12.5px] font-bold transition-colors",
                  tab === t ? "bg-bg-2 text-t0 shadow-[var(--shadow-vela)]" : "text-t1 hover:text-t0",
                )}
              >
                {t}
                <span className="rounded-full bg-bg-2 px-1.5 text-[10.5px] text-t2">{t === "All" ? orders.length : orders.filter((o) => o.status === t).length}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-[200px] max-w-[40vw] items-center gap-2 rounded-[11px] border border-line bg-bg-inset px-3">
              <IconSearch className="shrink-0 text-t2" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search orders…"
                className="min-w-0 flex-1 bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2"
              />
            </div>
          </div>
        </div>

        <div className="p-4">
          <DataTable
            columns={columns}
            data={pageRows}
            rowKey={(o) => o.id}
            onRowClick={(o) => navigate(paths.ecommerce.orderDetail(o.id))}
            emptyMessage="No orders match your filters."
          />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line p-4">
          <span className="text-[12.5px] text-t2">
            Showing <strong className="text-t1">{pageRows.length}</strong> of <strong className="text-t1">{filtered.length}</strong> orders
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}

function PageHeaderLocal() {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[12.5px] text-t2">
          <span>Ecommerce</span>
          <span className="text-t2">/</span>
          <span className="font-semibold text-t1">Orders</span>
        </div>
        <h1 className="text-xl font-extrabold text-t0 sm:text-[27px]">Orders</h1>
        <p className="mt-1.5 text-[13px] text-t1 sm:text-sm">Track, manage and fulfil every order in one place.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="secondary" icon={<IconDownload />}>
          Export
        </Button>
        <Link to={paths.ecommerce.orderNew}>
          <Button icon={<IconPlus />}>New order</Button>
        </Link>
      </div>
    </div>
  );
}
