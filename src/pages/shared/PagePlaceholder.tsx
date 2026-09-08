import { PageHeader } from "@/components/ui";

/**
 * Temporary stand-in for a page that hasn't been implemented yet. Every route
 * in the app resolves to a real page eventually; this keeps navigation and
 * layout testable while that work is in progress.
 */
export function PagePlaceholder({ title, group }: { title: string; group?: string }) {
  return (
    <div>
      <PageHeader title={title} subtitle={group ? `${group} · coming soon` : "Coming soon"} />
      <div className="flex min-h-[240px] items-center justify-center rounded-[var(--radius-vela-lg)] border border-dashed border-line bg-bg-2 text-sm text-t2">
        {title} page not yet implemented
      </div>
    </div>
  );
}
