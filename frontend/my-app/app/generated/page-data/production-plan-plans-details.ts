import { defineLegacyPage } from "../types";

export default defineLegacyPage({
  title: "Production Plans & Details",
  html: String.raw``,
  scripts: [
  {
    "src": "/js/app.js"
  },
  {
    "src": "/data/production/mock-production-plans.js"
  },
  {
    "src": "/js/production/production-color-palettes.js"
  },
  {
    "src": "/js/production/production-plans-details.js"
  },
  {
    "src": "https://nepalidatepicker.sajanmaharjan.com.np/v5/nepali.datepicker/js/nepali.datepicker.v5.0.6.min.js"
  },
  {
    "inline": "document.addEventListener(\"DOMContentLoaded\", function () {\r\n        // 1. Select your input elements\r\n        var fromDateInput = document.getElementById(\"fromDateFilter\");\r\n        var toDateInput = document.getElementById(\"toDateFilter\");\r\n\r\n        // 2. Create your configuration object\r\n        var datePickerOptions = {\r\n            miniEnglishDates: true\r\n            // You can add other options here later, comma-separated, like:\r\n            // ndpYear: true,\r\n            // ndpMonth: true\r\n        };\r\n\r\n        // 3. Pass the options object into the initialization functions\r\n        if (fromDateInput) {\r\n            fromDateInput.nepaliDatePicker(datePickerOptions);\r\n        }\r\n\r\n        if (toDateInput) {\r\n            toDateInput.nepaliDatePicker(datePickerOptions);\r\n        }\r\n    });"
  }
],
  styles: [
  "/css/production/production-plans-details.css"
],
  section: "production",
});
