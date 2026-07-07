import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Select Customer",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/crm/customers.js"
  },
  {
    "src": "/js/production/production-customers.js"
  }
],
  styles: [
  "/css/production/plan.css"
],
  section: "production",
});
