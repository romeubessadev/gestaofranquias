import { useNavigate } from "react-router-dom";
import { Button, FormField, Input, Select, Textarea } from "@/components/ui";
import { categories } from "@/data/ecommerce";
import { IconArrowLeft } from "./icons";

export function AddProduct() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-5.5 flex items-center gap-2.5">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-bg-2 px-3.5 text-[13px] font-semibold text-t1 hover:text-t0"
        >
          <IconArrowLeft />
          Back
        </button>
        <h1 className="text-xl font-extrabold text-t0">Add New Product</h1>
      </div>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4.5 text-[15px] font-bold text-t0">Basic information</h3>
            <div className="flex flex-col gap-3.5">
              <FormField label="Product name" required>
                <Input placeholder="e.g. Pro Wireless Headphones X9" />
              </FormField>
              <FormField label="Description">
                <Textarea placeholder="Describe your product…" />
              </FormField>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <FormField label="SKU">
                  <Input placeholder="e.g. HDP-X9-BLK" />
                </FormField>
                <FormField label="Barcode">
                  <Input placeholder="e.g. 123456789012" />
                </FormField>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4.5 text-[15px] font-bold text-t0">Pricing</h3>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <FormField label="Regular price" required>
                <Input placeholder="$0.00" />
              </FormField>
              <FormField label="Sale price">
                <Input placeholder="$0.00" />
              </FormField>
              <FormField label="Cost per item">
                <Input placeholder="$0.00" />
              </FormField>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-5.5 shadow-[var(--shadow-vela)]">
            <h3 className="mb-4.5 text-[15px] font-bold text-t0">Inventory</h3>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              <FormField label="Quantity">
                <Input placeholder="0" />
              </FormField>
              <FormField label="Low stock alert">
                <Input placeholder="10" />
              </FormField>
              <FormField label="Reorder qty">
                <Input placeholder="50" />
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-2.5">
            <Button variant="outline">Save draft</Button>
            <Button>Publish product</Button>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-[320px]">
          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Status</p>
            <Select defaultValue="Active">
              <option>Active</option>
              <option>Draft</option>
              <option>Archived</option>
            </Select>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Category</p>
            <Select defaultValue={categories[0]?.name}>
              {categories.map((c) => (
                <option key={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Product image</p>
            <div className="flex h-[140px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line hover:border-acc hover:bg-acc-soft">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-[12.5px] font-semibold text-t2">Drop image here</span>
              <span className="text-[11px] text-t2">PNG, JPG up to 5MB</span>
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-bg-2 p-4.5 shadow-[var(--shadow-vela)]">
            <p className="mb-3 text-xs font-bold uppercase tracking-wide text-t2">Tags</p>
            <Input placeholder="Add tags…" />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              <span className="rounded-full bg-acc-soft px-2.5 py-0.5 text-[11.5px] font-bold text-acc">electronics</span>
              <span className="rounded-full bg-info-soft px-2.5 py-0.5 text-[11.5px] font-bold text-info">wireless</span>
              <span className="rounded-full bg-ok-soft px-2.5 py-0.5 text-[11.5px] font-bold text-ok">audio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
