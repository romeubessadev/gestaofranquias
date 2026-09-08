import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  Checkbox,
  FormField,
  Input,
  PageHeader,
  Radio,
  Select,
  Switch,
  Textarea,
} from "@/components/ui";

const toggles = [
  { key: "notifications", label: "Email notifications", desc: "Receive product updates by email", initial: true },
  { key: "twofa", label: "Two-factor authentication", desc: "Require a code at sign-in", initial: true },
  { key: "beta", label: "Beta features", desc: "Try experimental functionality early", initial: false },
  { key: "sounds", label: "Sound effects", desc: "Play sounds on key actions", initial: false },
];

export function FormElementsPage() {
  const [toggleState, setToggleState] = useState<Record<string, boolean>>(
    Object.fromEntries(toggles.map((t) => [t.key, t.initial])),
  );
  const [range, setRange] = useState(65);

  return (
    <div>
      <PageHeader title="Form Elements" subtitle="All input types, selects, checkboxes, radios, toggles" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Text inputs</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-4">
              <FormField label="Default input">
                <Input placeholder="Type something…" />
              </FormField>
              <FormField label="With icon">
                <div className="relative">
                  <svg
                    className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--t2)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <Input placeholder="Search…" className="pl-10" />
                </div>
              </FormField>
              <FormField label="Success state">
                <Input defaultValue="Valid input" className="!border-2 !border-ok bg-ok-soft" />
              </FormField>
              <FormField label="Error state" error="Please enter a valid email address.">
                <Input defaultValue="Invalid email" className="!border-2 !border-bad bg-bad-soft" />
              </FormField>
              <FormField label="Disabled">
                <Input disabled placeholder="Disabled input" className="cursor-not-allowed opacity-60" />
              </FormField>
              <FormField label="Textarea">
                <Textarea placeholder="Enter your message…" />
              </FormField>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-4">
              <FormField label="Dropdown select">
                <Select defaultValue="">
                  <option value="" disabled>
                    Choose an option
                  </option>
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                  <option>Design</option>
                </Select>
              </FormField>
              <FormField label="Multi-select">
                <select
                  multiple
                  className="h-[110px] w-full rounded-[var(--radius-vela-md)] border border-line bg-bg-inset px-3.5 py-2 text-[13px] text-t0 outline-none focus:border-acc"
                  defaultValue={["Engineering"]}
                >
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                  <option>Design</option>
                  <option>Finance</option>
                </select>
              </FormField>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Checkboxes &amp; radios</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-t1">Checkboxes</p>
                <div className="flex flex-col gap-2.5">
                  <Checkbox label="Email me about product updates" defaultChecked />
                  <Checkbox label="Enable weekly digest" defaultChecked />
                  <Checkbox label="Share anonymous usage data" />
                </div>
              </div>
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-t1">Radio buttons</p>
                <div className="flex flex-col gap-2.5">
                  <Radio name="plan" label="Starter — $19/mo" defaultChecked />
                  <Radio name="plan" label="Growth — $49/mo" />
                  <Radio name="plan" label="Enterprise — custom pricing" />
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Toggles &amp; sliders</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-4">
              {toggles.map((t) => (
                <div key={t.key} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13.5px] font-semibold text-t0">{t.label}</p>
                    <p className="mt-0.5 text-[11.5px] text-t2">{t.desc}</p>
                  </div>
                  <Switch
                    checked={toggleState[t.key]}
                    onChange={(v) => setToggleState((s) => ({ ...s, [t.key]: v }))}
                  />
                </div>
              ))}
              <div>
                <p className="mb-2.5 text-[12.5px] font-bold text-t1">Range slider</p>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{ accentColor: "var(--acc)" }}
                />
                <div className="mt-1 flex justify-between text-[11.5px] text-t2">
                  <span>0%</span>
                  <span className="font-bold text-acc">{range}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Date &amp; time pickers</CardTitle>
            </CardHeader>
            <div className="flex flex-col gap-4">
              <FormField label="Date picker">
                <Input type="date" defaultValue="2026-06-29" />
              </FormField>
              <FormField label="Time picker">
                <Input type="time" defaultValue="14:30" />
              </FormField>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
