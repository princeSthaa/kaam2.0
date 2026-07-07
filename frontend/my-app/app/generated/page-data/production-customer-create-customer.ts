import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Create Customer Production Plan",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/crm/customers.js"
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
    "src": "/data/production/production-stages.js"
  },
  {
    "src": "/js/production/production-color-palettes.js"
  },
  {
    "src": "/js/production/production-plan-create.js"
  },
  {
    "src": "/js/production/production-draft-store.js"
  }
],
  styles: [
  "/css/production/plan.css"
],
  section: "production",
});
