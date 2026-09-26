import { useState } from "react";
import { Card, FormField, Input, PageHeader, Select, Textarea, WizardCardHeader, WizardNav, WizardSteps } from "@/components/ui";

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
        <WizardSteps steps={steps} current={current} />

        <Card padding="lg">
          <WizardCardHeader title="Company information" subtitle="Tell us about your organisation" />
          <div className="flex flex-col gap-4">
            <FormField label="Company name" required>
              <Input placeholder="e.g. Acme Corporation" />
            </FormField>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
            <WizardNav
              onPrevious={() => setCurrent((c) => Math.max(1, c - 1))}
              onNext={() => setCurrent((c) => Math.min(steps.length, c + 1))}
              previousLabel="Previous"
              nextLabel="Next"
              previousDisabled={current === 1}
              nextDisabled={current === steps.length}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
