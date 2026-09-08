import { Badge, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { products, type EcomProduct } from "@/data/ecommerce";
import { IconDownload } from "./icons";

const kpis = [
  { label: "Total SKUs", value: "248", sub: "Across 12 categories", color: "var(--t0)" },
  { label: "Units in stock", value: "12,480", sub: "$1.24M value", color: "var(--acc)" },
  { label: "Low stock", value: "8", sub: "Needs reorder", color: "var(--warn)" },
  { label: "Out of stock", value: "3", sub: "Lost sales risk", color: "var(--bad)" },
];

export function Inventory() {
  const columns: DataTableColumn<EcomProduct>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] text-[17px]" style={{ background: p.imgBg }}>
            {p.emoji}
          </div>
          <span className="truncate text-[13px] font-bold text-t0">{p.name}</span>
        </div>
      ),
    },
    { key: "sku", header: "SKU", hideBelow: "md", render: (p) => <span className="font-mono text-xs text-t2">{p.sku}</span> },
    {
      key: "stock",
      header: "In stock",
      align: "right",
      render: (p) => <span className={p.stock < 10 ? "font-mono text-[13.5px] font-extrabold text-bad" : "font-mono text-[13.5px] font-extrabold text-ok"}>{p.stock}</span>,
    },
    { key: "reserved", header: "Reserved", align: "right", hideBelow: "sm", render: (p) => <span className="font-mono text-[13px] font-bold text-t0">{p.reserved}</span> },
    {
      key: "status",
      header: "Status",
      align: "center",
      render: (p) => <Badge status={p.status}>{p.status}</Badge>,
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: () => (
        <button className="h-7 rounded-lg border border-line px-2.5 text-[11.5px] font-semibold text-t1 hover:bg-bg-3 hover:text-t0">Restock</button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="248 SKUs · 12,480 units total · 8 low stock"
        actions={
          <>
            <Button variant="secondary" icon={<IconDownload />}>
              Export CSV
            </Button>
            <Button className="bg-warn hover:opacity-90">Reorder low stock</Button>
          </>
        }
      />

      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-line bg-bg-2 p-4 shadow-[var(--shadow-vela)]">
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 text-[22px] font-extrabold" style={{ color: k.color }}>
              {k.value}
            </p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </div>
        ))}
      </div>

      <DataTable columns={columns} data={products} rowKey={(p) => p.id} />
    </div>
  );
}
