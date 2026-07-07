import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Select Outlet",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/production/outlet-demands.js"
  },
  {
    "src": "/js/production/production-outlets.js"
  }
],
  styles: [
  "/css/production/plan.css"
],
  section: "production",
});
