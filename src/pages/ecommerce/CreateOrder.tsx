import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Select } from "@/components/ui";
import { products, customers, initialsOf } from "@/data/ecommerce";
import { IconPlus, IconSearch } from "./icons";

interface DraftLine {
  productId: string;
  qty: number;
}

export function CreateOrder() {
  const navigate = useNavigate();
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [lines, setLines] = useState<DraftLine[]>([
    { productId: "p1", qty: 1 },
    { productId: "p3", qty: 1 },
  ]);

  const matches = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    if (q === "") return [];
    return customers.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)).slice(0, 5);
  }, [customerQuery]);

  const lineItems = lines
    .map((l) => ({ ...l, product: products.find((p) => p.id === l.productId)! }))
    .filter((l) => l.product);

  const subtotal = lineItems.reduce((s, l) => s + l.qty * (l.product.salePrice ?? l.product.price), 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const vipDiscount = selectedCustomer.segment === "VIP" ? 25 : 0;
  const total = Math.round((subtotal + tax - vipDiscount) * 100) / 100;
  const itemCount = lineItems.reduce((s, l) => s + l.qty, 0);

  function setQty(productId: string, delta: number) {
    setLines((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    );
  }

  function addNextProduct() {
    const existing = new Set(lines.map((l) => l.productId));
    const next = products.find((p) => !existing.has(p.id));
    if (next) setLines((prev) => [...prev, { productId: next.id, qty: 1 }]);
  }

  return (
    <div>
      <div className="mb-5.5 flex items-center gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-bg-2 px-3.5 text-[13px] font-semibold text-t1 hover:text-t0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back
        </button>
        <h1 className="text-xl font-extrabold text-t0">Create order</h1>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4.5 text-[15px] font-bold text-t0">Customer</h3>
            <div className="flex h-[42px] items-center gap-2 rounded-[11px] border border-line bg-bg-inset px-3.5">
              <IconSearch className="shrink-0 text-t2" />
              <input
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                placeholder="Search customer by name or email…"
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-t0 outline-none placeholder:text-t2"
              />
            </div>
            {matches.length > 0 && (
              <div className="mt-2 overflow-hidden rounded-xl border border-line bg-bg-inset">
                {matches.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setCustomerQuery("");
                    }}
                    className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-bg-3"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: c.avatarBg }}>
                      {initialsOf(c.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-t0">{c.name}</p>
                      <p className="truncate text-[11.5px] text-t2">{c.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-3 rounded-xl border border-acc-soft bg-bg-inset p-3.5">
              <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white" style={{ background: selectedCustomer.avatarBg }}>
                {initialsOf(selectedCustomer.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-bold text-t0">{selectedCustomer.name}</p>
                <p className="truncate text-xs text-t2">
                  {selectedCustomer.email} · {selectedCustomer.segment} · {selectedCustomer.ordersCount} orders
                </p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--acc)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <div className="mb-4.5 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-t0">Products</h3>
              <Button variant="outline" size="sm" icon={<IconPlus />} onClick={addNextProduct}>
                Add product
              </Button>
            </div>
            {lineItems.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-t2">No products added yet.</p>
            ) : (
              lineItems.map((l) => (
                <div key={l.productId} className="mb-2.5 flex flex-wrap items-center gap-3 rounded-xl bg-bg-inset p-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] text-xl" style={{ background: l.product.imgBg }}>
                    {l.product.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-t0">{l.product.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-t2">{l.product.sku}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(l.productId, -1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-base text-t1 hover:bg-bg-3"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-t0">{l.qty}</span>
                    <button
                      onClick={() => setQty(l.productId, 1)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-base text-t1 hover:bg-bg-3"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-[70px] text-right font-mono text-sm font-extrabold text-t0">
                    ${(l.qty * (l.product.salePrice ?? l.product.price)).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[340px]">
          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4 text-[15px] font-bold text-t0">Order summary</h3>
            <div className="mb-4 flex flex-col gap-2.5 border-b border-line pb-3.5">
              <div className="flex justify-between">
                <span className="text-[13px] text-t2">Subtotal ({itemCount} items)</span>
                <span className="font-mono text-[13px] font-bold text-t0">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-t2">Shipping</span>
                <span className="font-mono text-[13px] font-bold text-t0">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[13px] text-t2">Tax (8%)</span>
                <span className="font-mono text-[13px] font-bold text-t0">${tax.toFixed(2)}</span>
              </div>
              {vipDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-[13px] text-ok">VIP discount</span>
                  <span className="font-mono text-[13px] font-bold text-ok">−${vipDiscount.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="mb-4.5 flex justify-between">
              <span className="text-[15px] font-extrabold text-t0">Total</span>
              <span className="font-mono text-lg font-extrabold text-ok">${total.toFixed(2)}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-t2">Payment method</label>
                <Select defaultValue="Visa •••• 4242">
                  <option>Visa •••• 4242</option>
                  <option>Manual / Invoice</option>
                  <option>Bank transfer</option>
                </Select>
              </div>
              <Button fullWidth size="lg">
                Place order
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
