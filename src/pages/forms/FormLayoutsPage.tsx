import { Button, Card, CardHeader, CardTitle, FormField, Input, PageHeader, Select, Textarea } from "@/components/ui";

const horizontalFields = [
  { label: "Full name", placeholder: "Marcus Liu", type: "text", required: true },
  { label: "Email", placeholder: "marcus@vela.io", type: "email", required: true },
  { label: "Phone", placeholder: "+1 (555) 000-0000", type: "tel", required: false },
  { label: "Company", placeholder: "Vela Inc.", type: "text", required: false },
  { label: "Location", placeholder: "San Francisco, CA", type: "text", required: false },
];

export function FormLayoutsPage() {
  return (
    <div>
      <PageHeader title="Form Layouts" subtitle="Vertical, horizontal, and floating label layouts" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card padding="lg">
          <CardHeader>
            <CardTitle>Vertical layout</CardTitle>
          </CardHeader>
          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField label="First name" required>
                <Input placeholder="Marcus" />
              </FormField>
              <FormField label="Last name" required>
                <Input placeholder="Liu" />
              </FormField>
            </div>
            <FormField label="Email" required>
              <Input type="email" placeholder="marcus@vela.io" />
            </FormField>
            <FormField label="Department">
              <Select defaultValue="Sales">
                <option>Sales</option>
                <option>Engineering</option>
                <option>Marketing</option>
              </Select>
            </FormField>
            <FormField label="Bio">
              <Textarea placeholder="Brief bio…" className="min-h-[90px]" />
            </FormField>
            <div className="flex justify-end gap-2.5 pt-1">
              <Button variant="outline" type="button">Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Card>

        <div className="flex flex-col gap-5">
          <Card padding="lg">
            <CardHeader>
              <CardTitle>Horizontal layout</CardTitle>
            </CardHeader>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              {horizontalFields.map((f) => (
                <div key={f.label} className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2 sm:gap-4">
                  <label className="text-[12.5px] font-bold text-t1 sm:text-right">
                    {f.label}
                    {f.required && <span className="text-bad"> *</span>}
                  </label>
                  <Input type={f.type} placeholder={f.placeholder} className="!h-10" />
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] items-center gap-2 sm:gap-4">
                <label className="text-[12.5px] font-bold text-t1 sm:text-right">Role</label>
                <Select defaultValue="Admin" className="!h-10">
                  <option>Admin</option>
                  <option>Manager</option>
                  <option>Editor</option>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-4">
                <span className="hidden sm:block" />
                <div className="flex gap-2.5">
                  <Button variant="outline" type="button">Reset</Button>
                  <Button type="submit">Submit</Button>
                </div>
              </div>
            </form>
          </Card>

          <Card padding="lg">
            <CardHeader>
              <CardTitle>Floating labels</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-4">
              {["Email address", "Password"].map((label, i) => (
                <div key={label} className="relative">
                  <input
                    type={i === 1 ? "password" : "email"}
                    id={`float-${i}`}
                    placeholder=" "
                    className="peer h-[52px] w-full rounded-[var(--radius-vela-md)] border border-line bg-bg-inset px-3.5 pt-4 text-[13.5px] text-t0 outline-none focus:border-acc"
                  />
                  <label
                    htmlFor={`float-${i}`}
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-t2 transition-all peer-focus:top-3.5 peer-focus:text-[10.5px] peer-focus:font-bold peer-focus:text-acc peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-[10.5px] peer-[:not(:placeholder-shown)]:font-bold"
                  >
                    {label}
                  </label>
                </div>
              ))}
              <p className="text-[11.5px] text-t2">Labels float up when a field gains focus or holds a value.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
