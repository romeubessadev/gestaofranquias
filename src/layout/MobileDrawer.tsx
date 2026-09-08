import { Drawer } from "@/components/ui/Drawer";
import { SidebarContent } from "./SidebarContent";

export function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} width="280px">
      <SidebarContent onNavigate={onClose} />
    </Drawer>
  );
}
