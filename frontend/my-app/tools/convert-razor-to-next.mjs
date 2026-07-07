import fs from "node:fs";
import path from "node:path";

const sourceRoot = "D:/kaam/Pages";
const target = "D:/kaam2.0/frontend/my-app/app/generated/pages.ts";
const generatedRoot = "D:/kaam2.0/frontend/my-app/app/generated";
const pageDataRoot = `${generatedRoot}/page-data`;
const typesTarget = `${generatedRoot}/types.ts`;
const defaultPlanId = "PP-20260529-001";
const componentOverrideRoutes = new Set([
  "/",
  "/Privacy",
  "/Error",
  "/CRM/Audit",
  "/CRM/Order/CreateOrder",
  "/CreatePlan",
  "/CRM/Index",
  "/CRM/Customer/CreateCustomer",
  "/CRM/CustomerFilter/Index",
  "/Production/Index",
  "/Production/Create",
  "/Production/Customer/CreateCustomer",
  "/Production/Customer/Customers",
  "/Production/Outlet/CreateOutlet",
  "/Production/Outlet/Outlets",
  "/Production/Drafts",
  "/Production/InHouse/CreateInHouse",
  "/Production/InProgress",
  "/Production/Completed",
  "/Production/Plan/Details",
  "/Production/Plan/Edit",
  "/Production/Plan/PlansDetails",
  "/Production/Plan/StageUpdate",
  "/Warehouse/Index",
  "/Warehouse/Stock",
  "/Warehouse/Visualization",
]);

const customPages = [
  {
    route: "/CRM/Audit",
    title: "Financial Audit & Transactions",
    html: "",
    scripts: [
      { src: "/data/crm/audit-log.js" },
      { src: "/js/crm/crm-audit.js" },
    ],
    styles: ["/css/crm/audit.css"],
    section: "crm",
  },
];

const skipNames = new Set([
  "_ViewStart.cshtml",
  "_ViewImports.cshtml",
  "_Layout.cshtml",
  "_SideBarLayout.cshtml",
  "_ValidationScriptsPartial.cshtml",
  "_PlanCommonSections.cshtml",
]);

const pageFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.name.endsWith(".cshtml") && !skipNames.has(entry.name)) {
      pageFiles.push(full);
    }
  }
}

function routeFor(file) {
  const relative = path.relative(sourceRoot, file).replaceAll("\\", "/").replace(/\.cshtml$/, "");
  if (relative === "Index") return "/";
  return `/${relative}`;
}

function sectionFor(route) {
  const first = route.split("/").filter(Boolean)[0]?.toLowerCase();
  return ["production", "crm", "warehouse"].includes(first) ? first : "default";
}

function stripAtBlocks(input) {
  let output = input;
  const patterns = [
    /@if\s*\([^)]*\)\s*\{[\s\S]*?\n\s*\}/g,
    /@\{[\s\S]*?\n\}/g,
  ];

  for (const pattern of patterns) {
    output = output.replace(pattern, "");
  }

  return output;
}

function stripRazorSections(input) {
  let output = "";
  let index = 0;
  const sectionPattern = /@section\s+(Scripts|Styles)\s*\{/g;

  while (true) {
    sectionPattern.lastIndex = index;
    const match = sectionPattern.exec(input);
    if (!match) {
      output += input.slice(index);
      break;
    }

    output += input.slice(index, match.index);

    let cursor = sectionPattern.lastIndex;
    let depth = 1;
    let quote = "";

    while (cursor < input.length && depth > 0) {
      const char = input[cursor];
      const previous = input[cursor - 1];

      if (quote) {
        if (char === quote && previous !== "\\") {
          quote = "";
        }
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char;
      } else if (char === "{") {
        depth += 1;
      } else if (char === "}") {
        depth -= 1;
      }

      cursor += 1;
    }

    index = cursor;
  }

  return output;
}

function stripRazorControlBlocks(input) {
  let output = "";
  let index = 0;
  const blockPattern = /@(if|foreach)\s*\(/g;

  while (true) {
    blockPattern.lastIndex = index;
    const match = blockPattern.exec(input);
    if (!match) {
      output += input.slice(index);
      break;
    }

    output += input.slice(index, match.index);

    let cursor = blockPattern.lastIndex;
    let parenDepth = 1;
    let quote = "";

    while (cursor < input.length && parenDepth > 0) {
      const char = input[cursor];
      const previous = input[cursor - 1];

      if (quote) {
        if (char === quote && previous !== "\\") quote = "";
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === "(") {
        parenDepth += 1;
      } else if (char === ")") {
        parenDepth -= 1;
      }

      cursor += 1;
    }

    while (cursor < input.length && /\s/.test(input[cursor])) cursor += 1;

    if (input[cursor] !== "{") {
      index = cursor;
      continue;
    }

    cursor += 1;
    let braceDepth = 1;
    quote = "";

    while (cursor < input.length && braceDepth > 0) {
      const char = input[cursor];
      const previous = input[cursor - 1];

      if (quote) {
        if (char === quote && previous !== "\\") quote = "";
      } else if (char === '"' || char === "'" || char === "`") {
        quote = char;
      } else if (char === "{") {
        braceDepth += 1;
      } else if (char === "}") {
        braceDepth -= 1;
      }

      cursor += 1;
    }

    index = cursor;
  }

  return output;
}

function protectStyleBlocks(input) {
  const styles = [];
  const html = input.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (match) => {
    const key = `___LEGACY_STYLE_BLOCK_${styles.length}___`;
    styles.push(match.replaceAll("@@", "@"));
    return key;
  });

  return { html, styles };
}

function restoreStyleBlocks(input, styles) {
  return styles.reduce((html, style, index) => html.replace(`___LEGACY_STYLE_BLOCK_${index}___`, style), input);
}

function collectLinkedAssets(markup, tagName, attrName) {
  const assets = [];
  const regex = new RegExp(`<${tagName}\\b[^>]*?${attrName}=["']([^"']+)["'][^>]*>(?:\\s*</${tagName}>)?`, "gi");
  let match;
  while ((match = regex.exec(markup))) {
    const fullTag = match[0];
    const src = normalizeAssetUrl(match[1]);
    if (!src) continue;

    assets.push({
      src,
      type: /type=["']module["']/i.test(fullTag) ? "module" : undefined,
      inline: undefined,
    });
  }
  return assets;
}

function collectInlineScripts(markup) {
  const scripts = [];
  const regex = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(markup))) {
    const inline = match[1].trim();
    if (inline) {
      scripts.push({ inline: transformInlineScript(inline) });
    }
  }
  return scripts;
}

function transformInlineScript(script) {
  return fixTextEncoding(script)
    .replace(
      /const\s+backendFabrics\s*=\s*@Html\.Raw\([\s\S]*?\);/,
      "const backendFabrics = window.legacyPageModelData?.fabrics || [];"
    )
    .replace(/@Model\.[A-Za-z0-9_.]+/g, "");
}

function fixTextEncoding(value) {
  return value
    .replaceAll("â€º", "›")
    .replaceAll("Â·", "·")
    .replaceAll("â€“", "–")
    .replaceAll("Ã—", "×");
}

function normalizeAssetUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return url.replace(/^~\//, "/");
}

function cleanMarkup(input, route) {
  let output = input.replace(/^\uFEFF/, "");
  output = output.replace(/^@page.*$/gm, "");
  output = output.replace(/^@model.*$/gm, "");
  output = stripRazorSections(output);
  output = stripRazorControlBlocks(output);
  output = stripAtBlocks(output);

  const protectedStyles = protectStyleBlocks(output);
  output = protectedStyles.html;

  output = output.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/gi, "");
  output = output.replace(/^\s*else\s*\{\s*$/gm, "");
  output = output.replace(/^\s*else\s*$/gm, "");
  output = output.replace(/^\s*\}\s*$/gm, "");
  output = output.replace(/@await\s+Html\.PartialAsync\([^)]*\)/g, "");

  output = output.replace(/@Model\.(PlanId|PlanNo)/g, defaultPlanId);
  output = output.replace(/@Url\.Content\("~\/([^"]+)"\)/g, "/$1");
  output = output.replace(/~\//g, "/");

  output = output.replace(/\sasp-append-version=["'][^"']*["']/g, "");
  output = output.replace(/\sasp-route-id=["'][^"']*["']/g, "");
  output = output.replace(/\sasp-for=["']([^"']+)["']/g, (_match, field) => ` name="${field}"`);
  output = output.replace(/\sasp-validation-for=["'][^"']*["']/g, "");
  output = output.replace(/\sasp-page=["']([^"']+)["']/g, (_match, page) => {
    const href = page === "/Index" ? "/" : page;
    return ` href="${href}"`;
  });

  output = output.replace(/href="\/Production"/g, 'href="/Production/Index"');
  output = output.replace(/class="@[^"]*"/g, 'class=""');
  output = output.replace(/value="@[^"]*"/g, `value="${defaultPlanId}"`);
  output = output.replace(/@ViewData\[[^\]]+\]/g, "");
  output = output.replace(/@[^<\s"']+/g, "");

  output = restoreStyleBlocks(output, protectedStyles.styles);

  if (route === "/Warehouse/Index") {
    output = output.replace('data-template-url="/html/warehouse/module-panel.html"', 'data-template-url="/html/warehouse/module-panel.html"');
  }

  return fixTextEncoding(output.trim());
}

function titleFor(content, route) {
  const titleMatch = content.match(/ViewData\["Title"\]\s*=\s*"([^"]+)"/);
  if (titleMatch) return titleMatch[1];
  if (route === "/") return "Home";
  return route.split("/").filter(Boolean).at(-1) || "kaam";
}

function routeParts(route) {
  const parts = route.split("/").filter(Boolean);
  return parts.length ? parts : ["home"];
}

function kebabCaseRoute(route) {
  return routeParts(route)
    .join("-")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

function camelCaseRoute(route) {
  const words = kebabCaseRoute(route).split("-").filter(Boolean);
  return words
    .map((word, index) => index === 0 ? word : `${word[0].toUpperCase()}${word.slice(1)}`)
    .join("");
}

function uniqueName(baseName, usedNames) {
  let name = baseName;
  let suffix = 2;
  while (usedNames.has(name)) {
    name = `${baseName}${suffix}`;
    suffix += 1;
  }
  usedNames.add(name);
  return name;
}

function toTemplateLiteral(value) {
  return `String.raw\`${value
    .replaceAll("`", "\\`")
    .replaceAll("${", "\\${")}\``;
}

function serializePageDefinition(page) {
  return `{
  title: ${JSON.stringify(page.title)},
  html: ${toTemplateLiteral(page.html)},
  scripts: ${JSON.stringify(page.scripts, null, 2)},
  styles: ${JSON.stringify(page.styles, null, 2)},
  section: ${JSON.stringify(page.section)},
}`;
}

function pageHtmlForRoute(route, html) {
  return componentOverrideRoutes.has(route) ? "" : html;
}

function scriptsForRoute(route, scripts) {
  if (route === "/CreatePlan") {
    return [{ src: "/js/create-plan.js" }];
  }

  if (route === "/CRM/Order/CreateOrder") {
    return [
      { src: "/data/shared/products.js" },
      { src: "/data/shared/materials.js" },
      { src: "/data/shared/bom.js" },
      { src: "/js/crm/create-order.v3.js" },
    ];
  }

  return scripts;
}

walk(sourceRoot);

fs.mkdirSync(generatedRoot, { recursive: true });
fs.rmSync(pageDataRoot, { recursive: true, force: true });
fs.mkdirSync(pageDataRoot, { recursive: true });

const pageEntries = [];
const usedModuleNames = new Set();
const usedModuleFiles = new Set();
for (const file of pageFiles.sort()) {
  const raw = fs.readFileSync(file, "utf8");
  const route = routeFor(file);
  const scripts = [
    ...collectLinkedAssets(raw, "script", "src"),
    ...collectInlineScripts(raw),
  ];
  const styles = collectLinkedAssets(raw, "link", "href").map((asset) => asset.src);

  const page = {
    title: titleFor(raw, route),
    html: pageHtmlForRoute(route, cleanMarkup(raw, route)),
    scripts: scriptsForRoute(route, scripts),
    styles,
    section: sectionFor(route),
  };

  const moduleName = uniqueName(camelCaseRoute(route), usedModuleNames);
  const moduleFile = `${uniqueName(kebabCaseRoute(route), usedModuleFiles)}.ts`;
  const pageOutput = `import { defineLegacyPage } from "../types";\n\nexport default defineLegacyPage(${serializePageDefinition(page)});\n`;

  fs.writeFileSync(path.join(pageDataRoot, moduleFile), pageOutput);
  pageEntries.push({ route, moduleName, moduleFile });
}

for (const page of customPages) {
  const moduleName = uniqueName(camelCaseRoute(page.route), usedModuleNames);
  const moduleFile = `${uniqueName(kebabCaseRoute(page.route), usedModuleFiles)}.ts`;
  const pageOutput = `import { defineLegacyPage } from "../types";\n\nexport default defineLegacyPage(${serializePageDefinition(page)});\n`;

  fs.writeFileSync(path.join(pageDataRoot, moduleFile), pageOutput);
  pageEntries.push({ route: page.route, moduleName, moduleFile });
}

const typesOutput = `export type LegacyScript = { src?: string; type?: string; inline?: string };\n\nexport type LegacyPageDefinition = {\n  title: string;\n  html: string;\n  scripts: LegacyScript[];\n  styles: string[];\n  section: string;\n};\n\nexport function defineLegacyPage(page: LegacyPageDefinition) {\n  return page;\n}\n`;

const imports = pageEntries
  .map(({ moduleName, moduleFile }) => `import ${moduleName} from "./page-data/${moduleFile.replace(/\.ts$/, "")}";`)
  .join("\n");

const registryRows = pageEntries
  .map(({ route, moduleName }) => `  ${JSON.stringify(route)}: ${moduleName},`)
  .join("\n");

const output = `import type { LegacyPageDefinition, LegacyScript } from "./types";\n${imports}\n\nexport type { LegacyPageDefinition, LegacyScript } from "./types";\n\nexport const pages: Record<string, LegacyPageDefinition> = {\n${registryRows}\n};\n`;

fs.writeFileSync(typesTarget, typesOutput);
fs.writeFileSync(target, output);
