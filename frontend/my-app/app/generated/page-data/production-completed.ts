import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Completed Production",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/production/mock-production-plans.js"
  },
  {
    "src": "/js/production/production-draft-store.js"
  },
  {
    "src": "/js/production/production-plan-folder.js"
  }
],
  styles: [
  "/css/production/production-plans.css"
],
  section: "production",
});
