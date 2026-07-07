import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Create Outlet Production Plan",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/production/outlet-demands.js"
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
    "src": "/js/production/production-color-palettes.js"
  },
  {
    "src": "/js/production/outlet-plan-create.js"
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
