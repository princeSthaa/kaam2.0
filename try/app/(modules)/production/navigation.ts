import { SidebarSection } from "@/app/components/layout/Sidebar";

export const productionNavigation: SidebarSection = {
  title: "Production Menu",
  links: [
    { name: "Overview", url: "/production", icon: "dashboard" },
    { name: "Production Board", url: "/production/board", icon: "view_timeline" },
    { name: "Drafts", url: "/production/drafts", icon: "edit_note" },
    { name: "In Progress", url: "/production/in-progress", icon: "precision_manufacturing" },
    { name: "Completed", url: "/production/completed", icon: "task_alt" },
    { name: "Plans", url: "/production/plans", icon: "assignment" },
    { name: "Demands", url: "/production/demands", icon: "dynamic_feed" },
  ],
};
