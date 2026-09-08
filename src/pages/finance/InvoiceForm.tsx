import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardTitle, FormField, Input, Select, Textarea } from "@/components/ui";
import { paths } from "@/router/paths";
import { Icon, financeIcons } from "./Icons";
import { invoices } from "@/data/finance";

/** Shared Create/Edit invoice form. Edit mode is detected by the presence of
 * an :id route param and prefills from the fixture invoice. */
export function InvoiceForm({ mode }: { mode: "create" | "edit" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const invoice = isEdit ? (invoices.find((i) => i.id === id) ?? invoices[0]) : undefined;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <Button variant="secondary" size="sm" icon={<Icon d={financeIcons.arrowLeft} size={14} />} onClick={() => navigate(paths.finance.invoices)}>
            Back
          </Button>
          <h1 className="text-lg font-extrabold tracking-tight text-t0 sm:text-[23px]">
            {isEdit ? `Edit invoice ${invoice?.id}` : "Create invoice"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline">Save draft</Button>
          <Button>{isEdit ? "Save changes" : "Create & send"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-4">
          <Card padding="lg">
            <CardTitle className="mb-4">Client & dates</CardTitle>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="lg:col-span-2">
                <FormField label="Client" required>
                  <Select defaultValue={invoice?.client}>
                    <option>Acme Corporation</option>
                    <option>Northwind Inc.</option>
                    <option>Globex Ltd.</option>
                    <option>Initech</option>
                    <option>Stark Industries</option>
                  </Select>
                </FormField>
              </div>
              <FormField label="Issue date">
                <Input type="date" defaultValue={isEdit ? "2026-06-20" : undefined} />
              </FormField>
              <FormField label="Due date">
                <Input type="date" defaultValue={isEdit ? "2026-07-20" : undefined} />
              </FormField>
            </div>
          </Card>

          <Card padding="lg">
            <div className="mb-4 flex items-center justify-between">
              <CardTitle>Line items</CardTitle>
              <Button variant="outline" size="sm">+ Add line</Button>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_32px] gap-2.5 border-b border-line pb-2.5 text-[10.5px] font-bold uppercase tracking-wide text-t2">
                  <span>Description</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Rate</span>
                  <span className="text-right">Amount</span>
                  <span />
                </div>
                {(invoice?.lines ?? [
                  { desc: "", qty: 1, rate: "", amount: "$0" },
                  { desc: "", qty: 1, rate: "", amount: "$0" },
                ]).map((l, idx) => (
                  <div key={idx} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_32px] items-center gap-2.5 border-b border-line py-2.5">
                    <Input defaultValue={l.desc} placeholder="Item description" className="h-[38px]" />
                    <Input defaultValue={String(l.qty)} className="h-[38px] text-center" />
                    <Input defaultValue={l.rate} placeholder="$0" className="h-[38px] text-right" />
                    <span className="font-mono text-right text-[13px] font-bold text-t0">{l.amount}</span>
                    <button className="flex h-7 w-7 items-center justify-center rounded-[8px] text-t2 hover:text-bad" aria-label="Remove line">
                      <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="flex w-full max-w-[240px] flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-[13px] text-t2">Subtotal</span>
                  <span className="font-mono text-[13px] font-bold text-t0">{invoice?.subtotal ?? "$0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[13px] text-t2">Tax (8%)</span>
                  <span className="font-mono text-[13px] font-bold text-t0">{invoice?.tax ?? "$0"}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-2">
                  <span className="text-sm font-extrabold text-t0">Total</span>
                  <span className="font-mono text-base font-extrabold text-acc">{invoice?.total ?? "$0"}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-3 text-[11.5px] font-bold uppercase tracking-wide text-t2">Currency</p>
            <Select defaultValue="USD — US Dollar">
              <option>USD — US Dollar</option>
              <option>EUR — Euro</option>
              <option>GBP — British Pound</option>
            </Select>
          </Card>
          <Card>
            <p className="mb-2 text-[11.5px] font-bold uppercase tracking-wide text-t2">Notes</p>
            <Textarea placeholder="Payment terms, thank-you note…" className="min-h-[90px]" />
          </Card>
        </div>
      </div>
    </div>
  );
}
