import { useParams, useNavigate } from "react-router-dom";
import { Button, FormField, Input, Select, Textarea } from "@/components/ui";
import { products } from "@/data/ecommerce";
import { IconArrowLeft } from "./icons";

export function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find((p) => p.id === id) ?? products[0];

  return (
    <div>
      <div className="mb-5.5 flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-bg-2 px-3.5 text-[13px] font-semibold text-t1 hover:text-t0"
        >
          <IconArrowLeft />
          Back
        </button>
        <h1 className="text-xl font-extrabold text-t0">Edit Product</h1>
        <span className="ml-1 text-xs text-t2">· {product.name}</span>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4.5 text-[15px] font-bold text-t0">Basic information</h3>
            <div className="flex flex-col gap-3.5">
              <FormField label="Product name">
                <Input defaultValue={product.name} className="border-acc" />
              </FormField>
              <FormField label="Description">
                <Textarea defaultValue={product.description} />
              </FormField>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <FormField label="SKU">
                  <Input defaultValue={product.sku} />
                </FormField>
                <FormField label="Barcode">
                  <Input defaultValue={product.barcode} />
                </FormField>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4.5 text-[15px] font-bold text-t0">Pricing</h3>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <FormField label="Regular price">
                <Input defaultValue={product.price.toFixed(2)} />
              </FormField>
              <FormField label="Sale price">
                <Input defaultValue={(product.salePrice ?? product.price).toFixed(2)} />
              </FormField>
              <FormField label="Cost per item">
                <Input defaultValue={product.cost.toFixed(2)} />
              </FormField>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2.5">
            <Button variant="outline" className="border-bad-soft text-bad hover:bg-bad-soft">
              Delete product
            </Button>
            <Button variant="outline">Discard changes</Button>
            <Button>Save changes</Button>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Status</p>
            <Select defaultValue={product.lifecycle}>
              <option>Active</option>
              <option>Draft</option>
              <option>Archived</option>
            </Select>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Current image</p>
            <div className="mb-2.5 flex h-[140px] items-center justify-center rounded-xl text-6xl" style={{ background: product.imgBg }}>
              {product.emoji}
            </div>
            <button className="h-9 w-full rounded-[10px] border border-dashed border-line text-[12.5px] font-semibold text-t2 hover:border-acc hover:text-acc">
              Replace image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
