/** Small inline feather-style icon set for the Projects pages, matching the
 * stroke-icon convention used elsewhere in the app. */
export function Icon({ d, size = 16, className }: { d: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "shrink-0"}
    >
      <path d={d} />
    </svg>
  );
}

export const icons = {
  arrowLeft: "M19 12H5M12 5l-7 7 7 7",
  plus: "M12 5v14M5 12h14",
  check: "M20 6 9 17l-5-5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  comment: "M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z",
} as const;
