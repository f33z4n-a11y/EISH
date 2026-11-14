import { Fragment } from "react";
import { safeUrl } from "@/lib/issue-content";
function inline(s: string): React.ReactNode[] {
  return s
    .split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (link && safeUrl(link[2]))
        return (
          <a key={i} href={link[2]} target="_blank" rel="noopener noreferrer">
            {link[1]}
          </a>
        );
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={i}>{part.slice(1, -1)}</em>;
      return <Fragment key={i}>{part}</Fragment>;
    });
}
export function IssueText({ text }: { text: string }) {
  const lines = text.split("\n");
  const nodes: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^[-*] /.test(lines[i])) {
      const items = [];
      while (i < lines.length && /^[-*] /.test(lines[i])) {
        items.push(<li key={i}>{inline(lines[i].slice(2))}</li>);
        i++;
      }
      i--;
      nodes.push(<ul key={i}>{items}</ul>);
    } else nodes.push(<p key={i}>{inline(lines[i])}</p>);
  }
  return <div className="issue-text">{nodes}</div>;
}
