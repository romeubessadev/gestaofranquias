import { Link, useNavigate, useParams } from "react-router-dom";
import { Badge, Breadcrumbs, Button, Card, DataTable, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { Icon, financeIcons } from "./Icons";
import { invoices, type InvoiceLine } from "@/data/finance";

const lineColumns: DataTableColumn<InvoiceLine>[] = [
  { key: "desc", header: "Description", render: (l) => <span className="text-[13px] font-semibold text-t0">{l.desc}</span> },
  { key: "qty", header: "Qty", align: "center", render: (l) => <span className="text-t2">{l.qty}</span> },
  { key: "rate", header: "Rate", align: "right", render: (l) => <span className="font-mono text-t2">{l.rate}</span> },
  { key: "amount", header: "Amount", align: "right", render: (l) => <span className="font-mono font-bold text-t0">{l.amount}</span> },
];

export function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoice = invoices.find((i) => i.id === id) ?? invoices[0];
  const isPaid = invoice.status === "Paid";

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" icon={<Icon d={financeIcons.arrowLeft} size={14} />} onClick={() => navigate(paths.finance.invoices)}>
          Back
        </Button>
        <Breadcrumbs items={[{ label: "Invoices", to: paths.finance.invoices }, { label: invoice.id }]} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm" icon={<Icon d={financeIcons.download} size={13} />}>Download PDF</Button>
          <Button size="sm">Send invoice</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px] lg:items-start">
        {/* Invoice document */}
        <Card className="p-5 sm:p-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-acc text-white">
                <Icon d={financeIcons.layers} size={22} />
              </span>
              <div>
                <p className="text-lg font-extrabold text-t0">Vela Inc.</p>
                <p className="mt-0.5 text-xs text-t2">185 Berry St, San Francisco, CA</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold tracking-tight text-t0">INVOICE</p>
              <p className="mt-1 font-mono text-[13px] text-t2">#{invoice.id}</p>
              <div className="mt-2"><Badge status={invoice.status}>{invoice.status}</Badge></div>
            </div>
          </div>

          <div className="mb-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-t2">Bill to</p>
              <p className="text-sm font-bold text-t0">{invoice.client}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-t2">
                {invoice.clientEmail}
                <br />
                {invoice.clientAddress}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="mb-2 flex gap-4 sm:justify-end">
                <span className="text-xs text-t2">Issued</span>
                <span className="min-w-[90px] text-[12.5px] font-bold text-t0">{invoice.issued}</span>
              </div>
              <div className="flex gap-4 sm:justify-end">
                <span className="text-xs text-t2">Due date</span>
                <span className={`min-w-[90px] text-[12.5px] font-bold ${invoice.status === "Overdue" ? "text-bad" : invoice.status === "Pending" ? "text-warn" : "text-t0"}`}>
                  {invoice.due}
                </span>
              </div>
            </div>
          </div>

          <DataTable columns={lineColumns} data={invoice.lines} rowKey={(l) => l.desc} className="mb-5" />

          <div className="flex justify-end">
            <div className="flex w-full max-w-[260px] flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-[13px] text-t2">Subtotal</span>
                <span className="font-mono text-[13px] font-bold text-t0">{invoice.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-t2">Tax (8%)</span>
                <span className="font-mono text-[13px] font-bold text-t0">{invoice.tax}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-2.5">
                <span className="text-[15px] font-extrabold text-t0">Total due</span>
                <span className="font-mono text-lg font-extrabold text-acc">{invoice.total}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Side panel */}
        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Status</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ok text-white">
                  <Icon d={financeIcons.check} size={13} />
                </span>
                <span className="text-[12.5px] font-semibold text-t0">Invoice created</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ok text-white">
                  <Icon d={financeIcons.check} size={13} />
                </span>
                <span className="text-[12.5px] font-semibold text-t0">Sent to client</span>
              </div>
              <div className="flex items-center gap-2.5">
                {isPaid ? (
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ok text-white">
                    <Icon d={financeIcons.check} size={13} />
                  </span>
                ) : (
                  <span className="h-[26px] w-[26px] shrink-0 rounded-full border-2 border-line-2 bg-bg-3" />
                )}
                <span className={`text-[12.5px] ${isPaid ? "font-semibold text-t0" : "text-t2"}`}>Payment received</span>
              </div>
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Actions</p>
            <div className="flex flex-col gap-2">
              <Button fullWidth className="bg-ok hover:bg-ok hover:opacity-90" size="sm">Mark as paid</Button>
              <Link to={paths.finance.invoiceEdit(invoice.id)} className="w-full">
                <Button fullWidth variant="outline" size="sm">Edit invoice</Button>
              </Link>
              <Button fullWidth variant="outline" size="sm">Send reminder</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
