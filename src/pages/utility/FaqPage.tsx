import { Accordion } from "@/components/ui";

const FAQS = [
  {
    key: "trial",
    title: "How does the 14-day free trial work?",
    content:
      "You get full access to every feature on the Enterprise plan for 14 days — no credit card required. At the end of the trial you can pick a plan that fits, or your workspace simply pauses until you're ready.",
  },
  {
    key: "billing",
    title: "Can I change my plan at any time?",
    content:
      "Absolutely. Upgrade, downgrade or cancel from Account → Billing whenever you like. Upgrades take effect immediately and we prorate the difference; downgrades apply at the start of your next billing cycle.",
  },
  {
    key: "data",
    title: "Where is my data stored and is it secure?",
    content:
      "All data is encrypted in transit and at rest, hosted on SOC 2 Type II certified infrastructure. You can choose US or EU data residency, and enterprise customers can request a signed DPA.",
  },
  {
    key: "team",
    title: "How many team members can I invite?",
    content:
      "Starter includes up to 5 seats, Growth up to 25, and Enterprise is unlimited. Invite teammates from Settings → Members — they'll get an email with a link to join your workspace.",
  },
  {
    key: "integrations",
    title: "Which integrations do you support?",
    content:
      "Vela connects with Slack, Google Drive, GitHub, Salesforce, Zapier and dozens more out of the box. Anything not listed can be built on our REST API and webhooks.",
  },
  {
    key: "cancel",
    title: "What happens if I cancel?",
    content:
      "Your workspace stays active until the end of the current billing period. You can export all of your data at any time, and we keep it recoverable for 30 days after cancellation in case you change your mind.",
  },
];

export function FaqPage() {
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-7 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-t0">Frequently asked questions</h1>
        <p className="mt-2.5 text-[14.5px] text-t2">
          Everything you need to know about Vela. Can't find an answer?{" "}
          <a href="#" className="font-semibold text-acc">
            Contact support
          </a>
          .
        </p>
      </div>
      <Accordion items={FAQS} defaultOpen="trial" />
    </div>
  );
}
