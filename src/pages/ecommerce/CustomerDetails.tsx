import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge } from "@/components/ui";
import { paths } from "@/router/paths";
import { customers, orders, initialsOf, segmentVariant } from "@/data/ecommerce";
import { IconArrowLeft } from "./icons";

export function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customer = customers.find((c) => c.id === id) ?? customers[0];
  const recentOrders = orders.slice(0, 5);

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
          <Link to={paths.ecommerce.customersList} className="hover:text-t0">
            Customers
          </Link>
          <span>/</span>
          <span className="font-semibold text-t1">{customer.name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px]">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 text-center shadow-[var(--shadow-vela)]">
            <span className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full text-[26px] font-extrabold text-white" style={{ background: customer.avatarBg }}>
              {initialsOf(customer.name)}
            </span>
            <h2 className="mb-1 text-lg font-extrabold text-t0">{customer.name}</h2>
            <p className="mb-2 text-[13px] text-t2">{customer.email}</p>
            <Badge variant={segmentVariant(customer.segment)}>{customer.segment} Customer</Badge>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <div className="rounded-[11px] bg-bg-inset p-3">
                <p className="font-mono text-lg font-extrabold text-ok">${customer.totalSpent.toLocaleString()}</p>
                <p className="mt-0.5 text-[11px] text-t2">Total spent</p>
              </div>
              <div className="rounded-[11px] bg-bg-inset p-3">
                <p className="font-mono text-lg font-extrabold text-acc">{customer.ordersCount}</p>
                <p className="mt-0.5 text-[11px] text-t2">Orders</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Info</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-xs text-t2">Location</span>
                <span className="text-[12.5px] font-bold text-t0">{customer.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Joined</span>
                <span className="text-[12.5px] font-bold text-t0">{customer.joined}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Last order</span>
                <span className="text-[12.5px] font-bold text-t0">{customer.lastOrder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-t2">Avg. order</span>
                <span className="font-mono text-[12.5px] font-bold text-ok">${customer.avgOrder}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4 text-[15px] font-bold text-t0">Recent orders</h3>
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                to={paths.ecommerce.orderDetail(o.id)}
                className="flex items-center gap-3.5 border-b border-line py-3 last:border-b-0 hover:opacity-80"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-bold text-acc">{o.id}</p>
                  <p className="mt-0.5 text-[11.5px] text-t2">
                    {o.itemCount} items · {o.date}
                  </p>
                </div>
                <span className="font-mono text-[13.5px] font-extrabold text-t0">${o.total.toFixed(2)}</span>
                <Badge status={o.status}>{o.status}</Badge>
              </Link>
            ))}
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-3.5 text-[15px] font-bold text-t0">Notes</h3>
            <div className="mb-3 rounded-xl bg-bg-inset p-3.5">
              <p className="text-[13.5px] leading-[1.6] text-t1">{customer.notes}</p>
            </div>
            <textarea
              placeholder="Add a note…"
              className="min-h-[80px] w-full rounded-[11px] border border-line bg-bg-inset px-3.5 py-3 text-[13.5px] text-t0 outline-none transition-colors placeholder:text-t2 focus:border-acc"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
