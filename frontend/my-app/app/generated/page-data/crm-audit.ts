import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Financial Audit & Transactions",
  html: String.raw``,
  scripts: [
  {
    "src": "/data/crm/audit-log.js"
  },
  {
    "src": "/js/crm/crm-audit.js"
  }
],
  styles: [
  "/css/crm/audit.css"
],
  section: "crm",
});
