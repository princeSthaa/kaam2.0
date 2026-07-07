import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Stock",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/warehouse/stock.js"
  }
],
  styles: [
  "/css/warehouse/warehouse.css"
],
  section: "warehouse",
});
