import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { TiptapMark, TiptapNode } from "@/types/domain";

function applyMarks(content: ReactNode, marks: TiptapMark[] = []) {
  return marks.reduce<ReactNode>((result, mark, index) => {
    if (mark.type === "bold") return <strong key={index}>{result}</strong>;
    if (mark.type === "italic") return <em key={index}>{result}</em>;
    if (mark.type === "code") return <code key={index}>{result}</code>;
    if (mark.type === "strike") return <s key={index}>{result}</s>;
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      const href = mark.attrs.href;
      const safeHref = /^(https?:|mailto:|\/)/.test(href) ? href : "#";
      return (
        <a key={index} href={safeHref} rel="noreferrer" target="_blank">
          {result}
        </a>
      );
    }
    return result;
  }, content);
}

function renderNode(node: TiptapNode, key: number | string): ReactNode {
  if (node.type === "text") return <span key={key}>{applyMarks(node.text ?? "", node.marks)}</span>;
  if (node.type === "hardBreak") return <br key={key} />;

  const children = node.content?.map((child, index) => renderNode(child, index));

  switch (node.type) {
    case "doc":
      return <div key={key}>{children}</div>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = Number(node.attrs?.level ?? 2);
      if (level === 1) return <h1 key={key}>{children}</h1>;
      if (level === 3) return <h3 key={key}>{children}</h3>;
      return <h2 key={key}>{children}</h2>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return <pre key={key}><code>{children}</code></pre>;
    case "horizontalRule":
      return <hr key={key} />;
    default:
      return <div key={key}>{children}</div>;
  }
}

export function TiptapRenderer({ document, className }: { document: TiptapNode; className?: string }) {
  return (
    <div className={cn("note-prose", className)}>
      {renderNode(document, "root")}
    </div>
  );
}
