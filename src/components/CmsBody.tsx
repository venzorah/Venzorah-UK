import React from "react";

/** Renders CMS text: blank lines separate blocks, lines starting with "## " become headings. Text only — no HTML injection. */
export function CmsBody({ body }: {body: string;}) {
  const blocks = body.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-ink/85 leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        return (
          <div key={i}>
            {lines.map((line, j) =>
            line.startsWith("## ") ?
            <h2 key={j} className="text-lg font-bold text-navy mt-2">{line.slice(3)}</h2> :

            <p key={j}>{line}</p>

            )}
          </div>);

      })}
    </div>);

}