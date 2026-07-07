export type LegacyScript = { src?: string; type?: string; inline?: string };

export type LegacyPageDefinition = {
  title: string;
  html: string;
  scripts: LegacyScript[];
  styles: string[];
  section: string;
};

export function defineLegacyPage(page: LegacyPageDefinition) {
  return page;
}
