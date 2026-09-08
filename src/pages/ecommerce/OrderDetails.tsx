import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge, Button } from "@/components/ui";
import { paths } from "@/router/paths";
import { orders, customers, initialsOf } from "@/data/ecommerce";
import { cn } from "@/lib/cn";
import { IconArrowLeft } from "./icons";

const STEP_LABELS = ["Order placed", "Payment confirmed", "Shipped", "Delivered"];

function stepsForStatus(status: string) {
  const doneCount = status === "Delivered" ? 4 : status === "Shipped" ? 3 : status === "Cancelled" ? 1 : 2;
  const dates = ["Jun 27", "Jun 27", "Jun 29", "Jul 1"];
  return STEP_LABELS.map((label, i) => ({ label, done: i < doneCount, date: i < doneCount ? dates[i] : "—" }));
}

export function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const order = orders.find((o) => o.id === id) ?? orders[0];
  const customer = customers.find((c) => c.id === order.customerId) ?? customers[0];
  const steps = stepsForStatus(order.status);
  const doneCount = steps.filter((s) => s.done).length;
  const progressPct = steps.length > 1 ? ((doneCount - 1) / (steps.length - 1)) * 100 : 0;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-bg-2 px-3.5 text-[13px] font-semibold text-t1 hover:text-t0"
        >
          <IconArrowLeft />
          Back
        </button>
        <div className="flex items-center gap-1.5 text-[12.5px] text-t2">
          <Link to={paths.ecommerce.ordersList} className="hover:text-t0">
            Orders
          </Link>
          <span>/</span>
          <span className="font-mono font-semibold text-t1">#{order.id}</span>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Print invoice
          </Button>
          <Button size="sm">Mark shipped</Button>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-mono text-[15px] font-bold text-t0">Order #{order.id}</h3>
              <Badge status={order.status}>{order.status}</Badge>
            </div>
            <div className="relative flex items-start justify-between">
              <div className="absolute left-[10%] right-[10%] top-3.5 h-0.5 bg-line" />
              <div className="absolute left-[10%] top-3.5 h-0.5 bg-acc" style={{ width: `${progressPct * 0.8}%` }} />
              {steps.map((s) => (
                <div key={s.label} className="z-[1] flex flex-1 flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2",
                      s.done ? "border-acc bg-acc" : "border-line bg-bg-3",
                    )}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={s.done ? "#fff" : "var(--t2)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  <span className={cn("text-center text-[11px] font-bold", s.done ? "text-t0" : "text-t2")}>{s.label}</span>
                  <span className="text-[10px] text-t2">{s.date}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4 text-[15px] font-bold text-t0">Order items</h3>
            {order.items.map((item) => (
              <div key={item.sku} className="flex items-center gap-3.5 border-b border-line py-3">
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl text-2xl" style={{ background: item.imgBg }}>
                  {item.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-t0">{item.name}</p>
                  <p className="mt-0.5 text-xs text-t2">
                    SKU: <span className="font-mono">{item.sku}</span> · Qty: {item.qty}
                  </p>
                </div>
                <span className="font-mono text-[15px] font-extrabold text-t0">${(item.qty * item.price).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-3.5">
              <div className="mb-2 flex justify-between">
                <span className="text-[13px] text-t2">Subtotal</span>
                <span className="font-mono text-[13px] font-bold text-t0">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-[13px] text-t2">Shipping</span>
                <span className="font-mono text-[13px] font-bold text-t0">${order.shipping.toFixed(2)}</span>
              </div>
              <div className="mb-2 flex justify-between">
                <span className="text-[13px] text-t2">Tax (8%)</span>
                <span className="font-mono text-[13px] font-bold text-t0">${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-line pt-3">
                <span className="text-[15px] font-extrabold text-t0">Total</span>
                <span className="font-mono text-[17px] font-extrabold text-ok">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Customer</p>
            <Link to={paths.ecommerce.customerDetail(customer.id)} className="mb-3 flex items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: order.avatarBg }}>
                {initialsOf(order.customerName)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13.5px] font-bold text-t0 hover:text-acc">{order.customerName}</p>
                <p className="truncate text-xs text-t2">{order.email}</p>
              </div>
            </Link>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-xs text-t2">Orders</span>
                <span className="text-[12.5px] font-bold text-t0">{customer.ordersCount} total</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Total spent</span>
                <span className="font-mono text-[12.5px] font-bold text-ok">${customer.totalSpent.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Shipping address</p>
            <p className="text-[13px] leading-[1.7] text-t1">
              {order.customerName}
              <br />
              {order.shippingAddress.split(", ").map((line, i) => (
                <span key={i}>
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Payment</p>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-xs text-t2">Method</span>
                <span className="text-[12.5px] font-bold text-t0">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Status</span>
                <span className={cn("text-[12.5px] font-bold", order.paymentStatus === "Paid" ? "text-ok" : "text-warn")}>{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Date</span>
                <span className="text-[12.5px] font-bold text-t0">{order.date}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
