import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, PageHeader } from "@/components/ui";
import { paths } from "@/router/paths";
import { products, categories } from "@/data/ecommerce";
import { ProductThumb } from "./ProductThumb";
import { IconEdit, IconPlus, IconSearch, IconTrash } from "./icons";

export function ProductGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = query.trim() === "" || p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "All categories" || p.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category]);

  return (
    <div>
      <PageHeader
        crumbs={[{ label: "Ecommerce" }, { label: "Products" }]}
        title="Product Catalog"
        subtitle={`${products.length} products · ${categories.length} categories`}
        actions={
          <>
            <div className="flex h-[38px] items-center gap-2 rounded-[10px] border border-line bg-bg-2 px-3">
              <IconSearch className="shrink-0 text-t2" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products…"
                className="w-[140px] bg-transparent text-[13px] text-t0 outline-none placeholder:text-t2"
              />
            </div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-[38px] cursor-pointer rounded-[10px] border border-line bg-bg-2 px-3 text-[13px] text-t0 outline-none"
            >
              <option>All categories</option>
              {categories.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </select>
            <Link to={paths.ecommerce.productNew}>
              <Button icon={<IconPlus />}>Add product</Button>
            </Link>
          </>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-vela-lg)] border border-dashed border-line bg-bg-2 p-14 text-center text-sm text-t2">No products match your search.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl border border-line bg-bg-2 shadow-[var(--shadow-vela)] transition-colors hover:border-line-2">
              <Link to={paths.ecommerce.productDetail(p.id)} className="block">
                <ProductThumb product={p} className="h-[160px]">
                  <Badge status={p.status}>{p.status}</Badge>
                </ProductThumb>
              </Link>
              <div className="p-3.5">
                <p className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-t2">{p.category}</p>
                <Link to={paths.ecommerce.productDetail(p.id)}>
                  <p className="mb-2 truncate text-sm font-bold text-t0 hover:text-acc">{p.name}</p>
                </Link>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[17px] font-extrabold text-t0">${(p.salePrice ?? p.price).toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[13px] text-warn">★</span>
                    <span className="text-[12.5px] font-bold text-t0">{p.rating}</span>
                    <span className="text-[11.5px] text-t2">({p.reviews})</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2.5">
                  <span className="text-xs text-t2">
                    Stock: <strong className={p.stock < 10 ? "font-bold text-bad" : "font-bold text-t0"}>{p.stock}</strong>
                  </span>
                  <div className="flex gap-1.5">
                    <Link to={paths.ecommerce.productEdit(p.id)}>
                      <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-t2 hover:border-acc hover:text-acc">
                        <IconEdit />
                      </button>
                    </Link>
                    <button className="flex h-7 w-7 items-center justify-center rounded-lg border border-line text-t2 hover:border-bad hover:text-bad">
                      <IconTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
