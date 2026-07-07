import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Warehouse",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/warehouse/warehouse.js",
    "type": "module"
  }
],
  styles: [
  "/css/warehouse/warehouse.css"
],
  section: "warehouse",
});
