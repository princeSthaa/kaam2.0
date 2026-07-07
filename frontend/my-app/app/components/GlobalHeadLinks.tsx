import { fontLinks, globalStylesheets } from "../legacy/styles";

export function GlobalHeadLinks() {
  return (
    <>
      {fontLinks.map((link) => (
        <link
          key={link.href}
          rel={link.rel}
          href={link.href}
          crossOrigin={link.crossOrigin}
        />
      ))}
      {globalStylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} />
      ))}
    </>
  );
}
