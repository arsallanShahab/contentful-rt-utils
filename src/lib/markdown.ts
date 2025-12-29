import {
  Document,
  Block,
  Inline,
  Text,
  Node,
} from "@contentful/rich-text-types";

export type MarkdownOptions = {
  /** Custom renderer for embedded entries */
  renderEntry?: (node: Block | Inline) => string;
  /** Custom renderer for embedded assets */
  renderAsset?: (node: Block | Inline) => string;
};

/**
 * Converts a Contentful Rich Text Document to a Markdown string.
 *
 * @param document The Rich Text Document to convert.
 * @param options Configuration options for conversion.
 * @returns A Markdown string.
 */
export function richTextToMarkdown(
  document: Document | null,
  options: MarkdownOptions = {}
): string {
  if (!document) return "";
  return document.content
    .map((node) => convertNode(node, options, 0))
    .join("\n\n");
}

function convertNode(
  node: Node,
  options: MarkdownOptions,
  depth: number
): string {
  switch (node.nodeType) {
    case "paragraph":
      return (node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("");
    case "heading-1":
      return `# ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "heading-2":
      return `## ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "heading-3":
      return `### ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "heading-4":
      return `#### ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "heading-5":
      return `##### ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "heading-6":
      return `###### ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "blockquote":
      return `> ${(node as Block).content
        .map((child) => convertNode(child, options, depth))
        .join("")}`;
    case "hr":
      return "---";
    case "unordered-list":
      return (node as Block).content
        .map((child) =>
          convertListItem(child as Block, options, depth, undefined)
        )
        .join("\n");
    case "ordered-list":
      return (node as Block).content
        .map((child, i) =>
          convertListItem(child as Block, options, depth, i + 1)
        )
        .join("\n");
    case "hyperlink":
      const href = (node as Inline).data.uri;
      const text = (node as Inline).content
        .map((child) => convertNode(child, options, depth))
        .join("");
      return `[${text}](${href})`;
    case "text":
      return convertText(node as Text);
    case "embedded-asset-block":
      if (options.renderAsset) return options.renderAsset(node as Block);
      return `![${(node as Block).data.target?.fields?.title || "Asset"}](${
        (node as Block).data.target?.fields?.file?.url || ""
      })`;
    case "embedded-entry-block":
    case "embedded-entry-inline":
      if (options.renderEntry)
        return options.renderEntry(node as Block | Inline);
      return "";
    default:
      return "";
  }
}

function convertListItem(
  node: Block,
  options: MarkdownOptions,
  depth: number,
  index?: number
): string {
  const indent = "  ".repeat(depth);
  const prefix = index !== undefined ? `${index}.` : "-";

  const content = node.content
    .map((child) => {
      if (
        child.nodeType === "unordered-list" ||
        child.nodeType === "ordered-list"
      ) {
        return "\n" + convertNode(child, options, depth + 1);
      }
      return convertNode(child, options, depth);
    })
    .join("");

  return `${indent}${prefix} ${content}`;
}

function convertText(node: Text): string {
  let value = node.value;
  if (node.marks) {
    node.marks.forEach((mark) => {
      switch (mark.type) {
        case "bold":
          value = `**${value}**`;
          break;
        case "italic":
          value = `*${value}*`;
          break;
        case "underline":
          // Not standard markdown
          break;
        case "code":
          value = `\`${value}\``;
          break;
      }
    });
  }
  return value;
}
