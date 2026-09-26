import { cn } from "@/lib/cn";

/** Selo da marca no formato do `Badge` do Vela, na cor primária da marca (WEPINK rosa · WPINK roxo). */
export function BrandBadge({ brand, className }: { brand: "WEPINK" | "WPINK"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold leading-none",
        brand === "WPINK" ? "bg-wpink-soft text-wpink" : "bg-wepink-soft text-wepink",
        className,
      )}
    >
      {brand}
    </span>
  );
}
