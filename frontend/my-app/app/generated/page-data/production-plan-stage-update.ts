import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Update Production Stage",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/production/mock-production-plans.js"
  },
  {
    "src": "/data/production/production-stages.js"
  },
  {
    "src": "/js/production/production-plan-stage-update.js"
  }
],
  styles: [
  "/css/production/production-plans.css"
],
  section: "production",
});
