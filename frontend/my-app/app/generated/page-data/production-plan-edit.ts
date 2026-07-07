import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Edit Production Plan",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/crm/customers.js"
  },
  {
    "src": "/data/shared/outlets.js"
  },
  {
    "src": "/data/shared/products.js"
  },
  {
    "src": "/data/shared/materials.js"
  },
  {
    "src": "/data/shared/bom.js"
  },
  {
    "src": "/data/warehouse/warehouses.js"
  },
  {
    "src": "/data/production/production-stages.js"
  },
  {
    "src": "/data/production/mock-production-plans.js"
  },
  {
    "src": "/js/production/production-color-palettes.js"
  },
  {
    "src": "/js/production/production-plan-edit.js"
  }
],
  styles: [
  "/css/production/production-plans.css"
],
  section: "production",
});
