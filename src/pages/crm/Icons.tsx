/** Small inline feather-style icon set for the CRM pages, matching the
 * stroke-icon convention used elsewhere in the app (see layout/SidebarContent). */
export function Icon({ d, size = 18 }: { d: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d={d} />
    </svg>
  );
}

export const crmIcons = {
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  dollar: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  trendingUp: "M23 6l-9.5 9.5-5-5L1 18M17 6h6v6",
  phone: "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.9.7A2 2 0 0 1 22 16.9z",
  mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6",
  calendar: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18",
  file: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6",
  checkSquare: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  plus: "M12 5v14M5 12h14",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35",
  arrowLeft: "M19 12H5M12 5l-7 7 7 7",
  check: "M20 6 9 17l-5-5",
  megaphone: "M3 11v3a1 1 0 0 0 1 1h2l3.5 5V5L6 10H4a1 1 0 0 0-1 1ZM19 8a5 5 0 0 1 0 8M22 5a9 9 0 0 1 0 14",
  building: "M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 13v.01M9 17v.01",
  eye: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z",
  cart: "M6 6h15l-1.5 8.5h-13L4 3H2M6 6 4 3M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  star: "M12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2Z",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3Z",
  briefcase: "M20 7h-4V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 21V5H8v16",
};
