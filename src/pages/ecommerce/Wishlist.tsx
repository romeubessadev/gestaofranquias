import { Link } from "react-router-dom";
import { Button, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";
import { products } from "@/data/ecommerce";
import { IconHeart } from "./icons";

export function Wishlist() {
  return (
    <div>
      <PageHeader title="Wishlists" subtitle="4,284 items saved by customers" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => (
          <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-bg-2 shadow-[var(--shadow-vela)]">
            <div className="relative flex h-[160px] items-center justify-center text-5xl" style={{ background: p.imgBg }}>
              {p.emoji}
              <button className="absolute right-2.5 top-2.5 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-bad text-white hover:opacity-90">
                <IconHeart width={14} height={14} fill="currentColor" stroke="none" />
              </button>
            </div>
            <div className="p-3.5">
              <p className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-t2">{p.category}</p>
              <Link to={paths.ecommerce.productDetail(p.id)}>
                <p className="mb-2 truncate text-sm font-bold text-t0 hover:text-acc">{p.name}</p>
              </Link>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[17px] font-extrabold text-t0">${(p.salePrice ?? p.price).toFixed(2)}</span>
                <Button size="sm">Add to cart</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
