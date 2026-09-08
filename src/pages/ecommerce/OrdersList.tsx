import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { orders, initialsOf, type EcomOrder } from "@/data/ecommerce";
import { IconPlus, IconSearch } from "./icons";

const STATUS_OPTIONS = ["All status", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export function OrdersList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All status");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const matchesStatus = status === "All status" || o.status === status;
      const q = query.trim().toLowerCase();
      const matchesQuery = q === "" || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.email.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, status]);

  const revenue = orders.reduce((s, o) => s + o.total, 0);

  const columns: DataTableColumn<EcomOrder>[] = [
    {
      key: "order",
      header: "Order",
      render: (o) => (
        <div>
          <p className="font-mono text-[13px] font-bold text-acc">{o.id}</p>
          <p className="mt-0.5 text-[11px] text-t2">{o.itemCount} items</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (o) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: o.avatarBg }}>
            {initialsOf(o.customerName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-bold text-t0">{o.customerName}</p>
            <p className="truncate text-[11px] text-t2">{o.email}</p>
          </div>
        </div>
      ),
    },
    { key: "date", header: "Date", hideBelow: "md", render: (o) => <span className="text-[12.5px] text-t2">{o.date}</span> },
    { key: "total", header: "Total", align: "right", render: (o) => <span className="font-mono text-sm font-extrabold text-t0">${o.total.toFixed(2)}</span> },
    { key: "status", header: "Status", align: "center", render: (o) => <Badge status={o.status}>{o.status}</Badge> },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (o) => (
        <Link to={paths.ecommerce.orderDetail(o.id)} onClick={(e) => e.stopPropagation()} className="text-[12.5px] font-bold text-acc hover:underline">
          View
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders · $${revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} revenue`}
        actions={
          <>
            <div className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-bg-2 px-3">
              <IconSearch className="shrink-0 text-t2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search orders…"
                className="w-[130px] bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-[38px] cursor-pointer rounded-[10px] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <Link to={paths.ecommerce.orderNew}>
              <Button icon={<IconPlus />}>Create order</Button>
            </Link>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(o) => o.id}
        onRowClick={(o) => navigate(paths.ecommerce.orderDetail(o.id))}
        emptyMessage="No orders match your filters."
      />
      <div className="mt-3 flex items-center justify-between text-[12.5px] text-t2">
        <span>
          Showing {filtered.length} of {orders.length} orders
        </span>
      </div>
    </div>
  );
}
