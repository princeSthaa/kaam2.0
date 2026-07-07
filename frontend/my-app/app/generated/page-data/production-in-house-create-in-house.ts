import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Create In-house Production Plan",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/warehouse/warehouses.js"
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
    "src": "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
  },
  {
    "src": "/js/production/production-color-palettes.js"
  },
  {
    "src": "/js/production/inhouse-plan-create.js"
  },
  {
    "src": "/js/production/production-draft-store.js"
  }
],
  styles: [
  "/css/production/plan.css",
  "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/css/nepali.datepicker.v5.0.6.min.css"
],
  section: "production",
});
