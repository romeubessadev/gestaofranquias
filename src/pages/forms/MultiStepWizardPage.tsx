import { useState } from "react";
import { Button, Card, FormField, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";

const steps = [
  { num: 1, label: "Account" },
  { num: 2, label: "Company" },
  { num: 3, label: "Team" },
  { num: 4, label: "Review" },
];

export function MultiStepWizardPage() {
  const [current, setCurrent] = useState(2);

  return (
    <div>
      <PageHeader title="Multi-Step Wizard" subtitle="Step-by-step form with progress tracking" />
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-center">
          {steps.map((s, i) => {
            const done = s.num < current;
            const active = s.num === current;
            return (
              <div key={s.num} className="flex items-center">
                <div className="flex min-w-[80px] flex-col items-center gap-2">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-[13px] font-extrabold",
                      done && "border-acc bg-acc text-white",
                      active && "border-acc bg-acc-soft text-acc",
                      !done && !active && "border-line bg-bg-inset text-t2",
                    )}
                  >
                    {done ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={cn("whitespace-nowrap text-[11.5px] font-semibold", active ? "text-t0" : "text-t2")}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn("mb-5 h-0.5 w-10 sm:w-16", s.num < current ? "bg-acc" : "bg-line")} />
                )}
              </div>
            );
          })}
        </div>

        <Card padding="lg">
          <h3 className="text-lg font-bold text-t0">Company information</h3>
          <p className="mt-1 mb-6 text-[13.5px] text-t2">Tell us about your organisation</p>
          <div className="flex flex-col gap-4">
            <FormField label="Company name" required>
              <Input placeholder="e.g. Acme Corporation" />
            </FormField>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <FormField label="Industry">
                <Select defaultValue="Technology">
                  <option>Technology</option>
                  <option>Finance</option>
                  <option>Healthcare</option>
                  <option>Retail</option>
                </Select>
              </FormField>
              <FormField label="Company size">
                <Select defaultValue="51-200">
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>200+</option>
                </Select>
              </FormField>
            </div>
            <FormField label="Website">
              <Input placeholder="https://example.com" />
            </FormField>
            <FormField label="Description">
              <Textarea placeholder="What does your company do?" className="min-h-[90px]" />
            </FormField>
            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrent((c) => Math.max(1, c - 1))}
                disabled={current === 1}
                icon={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                }
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrent((c) => Math.min(steps.length, c + 1))}
                disabled={current === steps.length}
                iconRight={
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                }
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
