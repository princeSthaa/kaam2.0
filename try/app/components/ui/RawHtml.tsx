type RawHtmlProps = {
  html: string;
};

export function RawHtml({ html }: RawHtmlProps) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
