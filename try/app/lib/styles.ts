type HeadLink = {
  rel: string;
  href: string;
  crossOrigin?: "anonymous" | "use-credentials" | "";
};

export const fontLinks: HeadLink[] = [
  {
    rel: "preconnect",
    href: "https://fonts.googleapis.com",
  },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined",
  },
];

export const globalStylesheets = [
  "/lib/bootstrap/dist/css/bootstrap.min.css",
  "/css/site.css",
  "/css/app.css",
  "/css/components.css",
  "/css/crm/audit.css",
  "/css/sub-dashboard.css",
  "/css/production/production-plans.css",
  "/css/production/production-plans-details.css",
  "/css/production/production-plan-details-tab.css",
  "/css/production/plan.css",
  "/css/warehouse/warehouse.css",
  "/css/warehouse/warehouse-visualization.css",
];
