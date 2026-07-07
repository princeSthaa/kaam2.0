import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Create Order",
  html: String.raw``,
  scripts: [
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
    "src": "/js/crm/create-order.v3.js"
  }
],
  styles: [],
  section: "crm",
});
