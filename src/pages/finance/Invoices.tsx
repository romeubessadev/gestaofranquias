import { useNavigate, Link } from "react-router-dom";
import { Avatar, Badge, Button, Card, DataTable, PageHeader, Select, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { Icon, financeIcons } from "./Icons";
import { invoiceKpis, invoices, type Invoice } from "@/data/finance";

const columns: DataTableColumn<Invoice>[] = [
  { key: "id", header: "Invoice", render: (i) => <span className="font-mono text-[13px] font-bold text-acc">{i.id}</span> },
  {
    key: "client",
    header: "Client",
    render: (i) => (
      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar name={i.client} size="sm" />
        <span className="truncate text-[12.5px] font-bold text-t0">{i.client}</span>
      </div>
    ),
  },
  { key: "issued", header: "Issued", render: (i) => <span className="text-t2">{i.issued}</span>, hideBelow: "md" },
  { key: "due", header: "Due", render: (i) => <span className="text-t2">{i.due}</span>, hideBelow: "lg" },
  { key: "status", header: "Status", align: "center", render: (i) => <Badge status={i.status}>{i.status}</Badge> },
  { key: "amount", header: "Amount", align: "right", render: (i) => <span className="font-mono font-extrabold text-t0">{i.amount}</span> },
];

export function Invoices() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle="284 invoices · $184k outstanding"
        actions={
          <>
            <div className="w-36">
              <Select>
                <option>All status</option>
                <option>Paid</option>
                <option>Pending</option>
                <option>Overdue</option>
                <option>Draft</option>
              </Select>
            </div>
            <Link to={paths.finance.invoiceNew}>
              <Button icon={<Icon d={financeIcons.plus} size={14} />}>Create invoice</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {invoiceKpis.map((k) => (
          <Card key={k.label}>
            <p className="text-[11.5px] font-bold uppercase tracking-wide text-t2">{k.label}</p>
            <p className="mt-1.5 font-mono text-[22px] font-extrabold" style={{ color: k.color }}>{k.value}</p>
            <p className="mt-0.5 text-[11.5px] text-t2">{k.sub}</p>
          </Card>
        ))}
      </div>

      <div className="mt-4">
        <DataTable
          columns={columns}
          data={invoices}
          rowKey={(i) => i.id}
          onRowClick={(i) => navigate(paths.finance.invoiceDetail(i.id))}
        />
      </div>
    </div>
  );
}
