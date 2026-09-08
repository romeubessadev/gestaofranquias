import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { customers, initialsOf, segmentVariant, type EcomCustomer } from "@/data/ecommerce";
import { IconDownload, IconSearch } from "./icons";

const kpis = [
  { label: "Total customers", value: "3,842", sub: "+124 this month", color: "var(--t0)", subColor: "var(--ok)" },
  { label: "Active this month", value: "1,286", sub: "33% of base", color: "var(--acc)", subColor: "var(--t2)" },
  { label: "Avg. lifetime value", value: "$318", sub: "+$24 vs last quarter", color: "var(--ok)", subColor: "var(--ok)" },
  { label: "Churn rate", value: "2.1%", sub: "-0.4% vs last month", color: "var(--warn)", subColor: "var(--ok)" },
];

export function CustomersList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q === "") return customers;
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
  }, [query]);

  const columns: DataTableColumn<EcomCustomer>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (c) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="relative shrink-0">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: c.avatarBg }}>
              {initialsOf(c.name)}
            </span>
            {c.online && <span className="absolute bottom-0 right-0 h-[9px] w-[9px] rounded-full border-2 border-bg-2 bg-ok" />}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-t0">{c.name}</p>
            <p className="truncate text-[11px] text-t2">{c.email}</p>
          </div>
        </div>
      ),
    },
    { key: "location", header: "Location", hideBelow: "md", render: (c) => <span className="text-[12.5px] text-t2">{c.location}</span> },
    { key: "orders", header: "Orders", align: "right", hideBelow: "sm", render: (c) => <span className="font-mono text-[13px] font-bold text-t0">{c.ordersCount}</span> },
    { key: "spent", header: "Total spent", align: "right", render: (c) => <span className="font-mono text-[13.5px] font-extrabold text-ok">${c.totalSpent.toLocaleString()}</span> },
    { key: "segment", header: "Segment", align: "center", render: (c) => <Badge variant={segmentVariant(c.segment)}>{c.segment}</Badge> },
    { key: "joined", header: "Joined", align: "right", hideBelow: "lg", render: (c) => <span className="text-xs text-t2">{c.joined}</span> },
  ];

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="3,842 customers · $1.2M lifetime value"
        actions={
          <>
            <div className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-bg-2 px-3">
              <IconSearch className="shrink-0 text-t2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customers…"
                className="w-[140px] bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2"
              />
            </div>
            <Button variant="secondary" icon={<IconDownload />}>
              Export
            </Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-bg-2 p-4 shadow-[var(--shadow-vela)]">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 font-mono text-[22px] font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-0.5 text-[11.5px]" style={{ color: k.subColor }}>
              {k.sub}
            </p>
          </div>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(c) => c.id}
        onRowClick={(c) => navigate(paths.ecommerce.customerDetail(c.id))}
        emptyMessage="No customers match your search."
      />
      <div className="mt-3 text-[12.5px] text-t2">Showing {filtered.length} of 3,842 customers</div>
    </div>
  );
}
