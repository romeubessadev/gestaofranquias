import { Link, useNavigate } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, type DataTableColumn } from "@/components/ui";
import { paths } from "@/router/paths";
import { products, categories, type EcomProduct } from "@/data/ecommerce";
import { ProductThumb } from "./ProductThumb";
import { IconEdit, IconPlus, IconTrash } from "./icons";

export function ProductList() {
  const navigate = useNavigate();

  const columns: DataTableColumn<EcomProduct>[] = [
    {
      key: "product",
      header: "Product",
      render: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          <ProductThumb product={p} rounded="rounded-[10px]" className="h-[42px] w-[42px] shrink-0 text-xl" />
          <div className="min-w-0">
            <p className="truncate text-[13.5px] font-bold text-t0">{p.name}</p>
            <p className="mt-0.5 text-[11px] text-t2">
              SKU: <span className="font-mono">{p.sku}</span>
            </p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", hideBelow: "md", render: (p) => <span className="text-[12.5px] text-t1">{p.category}</span> },
    { key: "price", header: "Price", align: "right", render: (p) => <span className="font-mono text-sm font-extrabold text-t0">${p.price.toFixed(2)}</span> },
    {
      key: "stock",
      header: "Stock",
      align: "center",
      hideBelow: "sm",
      render: (p) => <span className={p.stock < 10 ? "text-[13.5px] font-bold text-bad" : "text-[13.5px] font-bold text-t0"}>{p.stock}</span>,
    },
    { key: "status", header: "Status", align: "center", render: (p) => <Badge status={p.status}>{p.status}</Badge> },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Link to={paths.ecommerce.productEdit(p.id)}>
            <button className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-line text-t2 hover:border-acc hover:text-acc">
              <IconEdit />
            </button>
          </Link>
          <button className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-line text-t2 hover:border-bad hover:text-bad">
            <IconTrash />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} total · ${categories.length} categories`}
        actions={
          <Link to={paths.ecommerce.productNew}>
            <Button icon={<IconPlus />}>Add product</Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={products} rowKey={(p) => p.id} onRowClick={(p) => navigate(paths.ecommerce.productDetail(p.id))} />
    </div>
  );
}
