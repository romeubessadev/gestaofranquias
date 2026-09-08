import { cn } from "@/lib/cn";
import { SidebarContent } from "./SidebarContent";

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-line bg-bg-1 transition-[width] duration-200 lg:flex lg:flex-col",
        collapsed ? "lg:w-[76px]" : "lg:w-[258px]",
      )}
    >
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}
