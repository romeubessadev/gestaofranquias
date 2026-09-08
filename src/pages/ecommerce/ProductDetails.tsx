import { useParams, useNavigate, Link } from "react-router-dom";
import { Badge, Button, Rating } from "@/components/ui";
import { AreaLineChart } from "@/components/charts";
import { paths } from "@/router/paths";
import { products } from "@/data/ecommerce";
import { ProductThumb } from "./ProductThumb";
import { IconArrowLeft } from "./icons";

const salesTrend = [12, 18, 15, 24, 20, 28, 26, 32, 29, 36, 34, 40];

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id) ?? products[0];

  const margin = product.salePrice
    ? (((product.salePrice - product.cost) / product.salePrice) * 100).toFixed(1)
    : (((product.price - product.cost) / product.price) * 100).toFixed(1);

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
          <Link to={paths.ecommerce.productGrid} className="hover:text-t0">
            Products
          </Link>
          <span>/</span>
          <span className="font-semibold text-t1">{product.name}</span>
        </div>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4.5">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <div className="flex flex-wrap gap-5">
              <ProductThumb product={product} rounded="rounded-2xl" className="h-[220px] w-[220px] shrink-0 text-7xl" />
              <div className="min-w-[200px] flex-1">
                <Badge status={product.lifecycle}>{product.lifecycle}</Badge>
                <h2 className="mt-2.5 mb-1.5 text-xl font-extrabold text-t0 sm:text-[22px]">{product.name}</h2>
                <div className="mb-3.5 flex items-center gap-2">
                  <Rating value={product.rating} />
                  <span className="text-[13px] font-bold text-t0">{product.rating}</span>
                  <span className="text-[12.5px] text-t2">({product.reviews} reviews)</span>
                </div>
                <p className="mb-4 font-mono text-[26px] font-extrabold text-acc sm:text-[28px]">${(product.salePrice ?? product.price).toFixed(2)}</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-bg-inset p-3">
                    <p className="text-[11px] font-semibold text-t2">SKU</p>
                    <p className="mt-1 font-mono text-[13.5px] font-bold text-t0">{product.sku}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-bg-inset p-3">
                    <p className="text-[11px] font-semibold text-t2">Stock</p>
                    <p className="mt-1 text-[13.5px] font-bold text-ok">{product.stock} units</p>
                  </div>
                  <div className="rounded-xl border border-line bg-bg-inset p-3">
                    <p className="text-[11px] font-semibold text-t2">Category</p>
                    <p className="mt-1 text-[13.5px] font-bold text-t0">{product.category}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-bg-inset p-3">
                    <p className="text-[11px] font-semibold text-t2">Total sold</p>
                    <p className="mt-1 text-[13.5px] font-bold text-acc">{product.unitsSold.toLocaleString()} units</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4.5 border-t border-line pt-4">
              <h3 className="mb-2.5 text-sm font-bold text-t0">Description</h3>
              <p className="text-[13.5px] leading-[1.7] text-t1">{product.description}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-bold text-t0">Sales performance</h3>
              <span className="text-xs text-t2">Last 30 days</span>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-3.5">
              <div className="rounded-xl bg-bg-inset p-3.5 text-center">
                <p className="text-xl font-extrabold text-ok sm:text-[22px]">$38,220</p>
                <p className="mt-1 text-[11.5px] text-t2">Revenue</p>
              </div>
              <div className="rounded-xl bg-bg-inset p-3.5 text-center">
                <p className="text-xl font-extrabold text-acc sm:text-[22px]">128</p>
                <p className="mt-1 text-[11.5px] text-t2">Units sold</p>
              </div>
              <div className="rounded-xl bg-bg-inset p-3.5 text-center">
                <p className="text-xl font-extrabold text-info sm:text-[22px]">{product.rating}★</p>
                <p className="mt-1 text-[11.5px] text-t2">Rating</p>
              </div>
            </div>
            <AreaLineChart data={salesTrend} height={100} formatValue={(v) => `${v} units`} />
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Quick actions</p>
            <div className="flex flex-col gap-2">
              <Link to={paths.ecommerce.productEdit(product.id)}>
                <Button fullWidth>Edit product</Button>
              </Link>
              <Button variant="outline" fullWidth>
                Duplicate
              </Button>
              <Button variant="outline" fullWidth className="border-bad-soft text-bad hover:bg-bad-soft">
                Archive product
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Inventory</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">In stock</span>
                <span className="text-[13px] font-bold text-ok">{product.stock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">Reserved</span>
                <span className="text-[13px] font-bold text-t0">{product.reserved}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">Reorder point</span>
                <span className="text-[13px] font-bold text-warn">{product.reorderPoint}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-bg-inset">
                <div className="h-full rounded-full bg-ok" style={{ width: `${Math.min(100, Math.round((product.stock / (product.stock + product.reserved + 20)) * 100))}%` }} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3.5 text-[11.5px] font-bold uppercase tracking-wide text-t2">Pricing</p>
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">Regular price</span>
                <span className="text-[13px] font-bold text-t0">${product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">Sale price</span>
                <span className="text-[13px] font-bold text-bad">${(product.salePrice ?? product.price).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">Cost</span>
                <span className="text-[13px] font-bold text-t0">${product.cost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12.5px] text-t2">Margin</span>
                <span className="text-[13px] font-bold text-ok">{margin}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
