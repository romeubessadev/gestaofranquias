import { useState } from "react";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/cn";
import { CheckIcon } from "@/pages/utility/icons";

interface Plan {
  name: string;
  desc: string;
  monthly: number;
  yearly: number;
  featured?: boolean;
  cta: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    name: "Starter",
    desc: "For individuals and small side projects getting off the ground.",
    monthly: 0,
    yearly: 0,
    cta: "Start for free",
    features: ["Up to 5 team members", "3 dashboards", "7-day data history", "Community support"],
  },
  {
    name: "Growth",
    desc: "For growing teams that need deeper analytics and collaboration.",
    monthly: 49,
    yearly: 39,
    featured: true,
    cta: "Start free trial",
    features: ["Up to 25 team members", "Unlimited dashboards", "1-year data history", "Priority support", "API access"],
  },
  {
    name: "Enterprise",
    desc: "For organizations with advanced security and scale requirements.",
    monthly: 199,
    yearly: 159,
    cta: "Contact sales",
    features: ["Unlimited members", "Unlimited everything", "Unlimited history", "Dedicated success manager", "SSO & SAML", "SLA guarantee"],
  },
];

export function PricingPage() {
  const [yearly, setYearly] = useState(false);
  return (
    <div>
      <div className="mx-auto mb-9 max-w-[560px] text-center">
        <Badge variant="accent" className="mb-4">
          Pricing
        </Badge>
        <h1 className="text-[32px] font-extrabold tracking-tight text-t0">Simple, transparent pricing</h1>
        <p className="mt-3 text-[15px] text-t1">Start free and scale as you grow. No hidden fees, cancel anytime.</p>
        <div className="mt-5.5 inline-flex gap-1 rounded-xl border border-line bg-bg-2 p-1">
          <button
            onClick={() => setYearly(false)}
            className={cn("rounded-[9px] px-4.5 py-2 text-[12.5px] font-bold", !yearly ? "bg-acc text-white" : "text-t1 hover:text-t0")}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={cn("rounded-[9px] px-4.5 py-2 text-[12.5px] font-bold", yearly ? "bg-acc text-white" : "text-t1 hover:text-t0")}
          >
            Yearly <span className="text-ok">−20%</span>
          </button>
        </div>
      </div>
      <div className="mx-auto grid max-w-[1040px] grid-cols-1 gap-5 md:grid-cols-3">
        {PLANS.map((p) => {
          const price = yearly ? p.yearly : p.monthly;
          return (
            <Card
              key={p.name}
              padding="lg"
              className={cn("relative flex flex-col", p.featured && "border-acc ring-1 ring-acc")}
            >
              {p.featured && (
                <span className="absolute right-4.5 top-4.5">
                  <Badge variant="accent">Most popular</Badge>
                </span>
              )}
              <p className="text-[15px] font-bold text-t0">{p.name}</p>
              <p className="mb-4 mt-1.5 min-h-[34px] text-[12.5px] text-t2">{p.desc}</p>
              <div className="mb-5 flex items-baseline gap-1">
                <span className="text-[38px] font-extrabold tracking-tight text-t0">${price}</span>
                <span className="text-sm font-semibold text-t2">/mo</span>
              </div>
              <Button variant={p.featured ? "primary" : "outline"} fullWidth>
                {p.cta}
              </Button>
              <div className="my-5 h-px bg-line" />
              <div className="flex flex-col gap-3">
                {p.features.map((f) => (
                  <div key={f} className="flex items-center gap-2.5 text-[13px] text-t1">
                    <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-ok-soft text-ok">
                      <CheckIcon size={11} />
                    </span>
                    {f}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
