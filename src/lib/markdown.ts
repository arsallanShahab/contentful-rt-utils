import {
  Document,
  Block,
  Inline,
  Text,
  Node,
  BLOCKS,
  INLINES,
  MARKS,
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
  if (!Array.isArray(document.content) || document.content.length === 0) {
    return "";
  }

  return document.content
    .map((node) => convertNode(node, options, 0))
    .filter((content) => content.trim() !== "")
    .join("\n\n");
}

/**
 * Process content within a block node
 */
function processContent(
  node: Block | Inline,
  options: MarkdownOptions = {},
  depth: number = 0
): string {
  if (!Array.isArray(node.content)) return "";
  return node.content
    .map((child) => convertNode(child, options, depth))
    .join("");
}

function convertNode(
  node: Node,
  options: MarkdownOptions,
  depth: number
): string {
  if (!node || typeof node !== "object") {
    return "";
  }

  try {
    switch (node.nodeType) {
      case BLOCKS.PARAGRAPH:
        return processContent(node as Block, options, depth);

      case BLOCKS.HEADING_1:
        return `# ${processContent(node as Block, options, depth)}`;

      case BLOCKS.HEADING_2:
        return `## ${processContent(node as Block, options, depth)}`;

      case BLOCKS.HEADING_3:
        return `### ${processContent(node as Block, options, depth)}`;

      case BLOCKS.HEADING_4:
        return `#### ${processContent(node as Block, options, depth)}`;

      case BLOCKS.HEADING_5:
        return `##### ${processContent(node as Block, options, depth)}`;

      case BLOCKS.HEADING_6:
        return `###### ${processContent(node as Block, options, depth)}`;

      case BLOCKS.QUOTE:
        return `> ${processContent(node as Block, options, depth)}`;

      case BLOCKS.HR:
        return "---";

      case BLOCKS.UL_LIST:
        return convertUnorderedList(node as Block, options, depth);

      case BLOCKS.OL_LIST:
        return convertOrderedList(node as Block, options, depth);

      case BLOCKS.LIST_ITEM:
        return processContent(node as Block, options, depth);

      case INLINES.HYPERLINK:
        return convertHyperlink(node as Inline, options, depth);

      case "text":
        return convertText(node as Text);

      case BLOCKS.EMBEDDED_ASSET:
        if (options.renderAsset) return options.renderAsset(node as Block);
        return convertEmbeddedAsset(node as Block);

      case BLOCKS.EMBEDDED_ENTRY:
      case INLINES.EMBEDDED_ENTRY:
        if (options.renderEntry)
          return options.renderEntry(node as Block | Inline);
        return "";

      default:
        return "";
    }
  } catch (error) {
    console.warn(`Error converting node of type ${node.nodeType}:`, error);
    return "";
  }
}

/**
 * Convert unordered list
 */
function convertUnorderedList(
  node: Block,
  options: MarkdownOptions,
  depth: number
): string {
  if (!Array.isArray(node.content)) return "";

  return node.content
    .map((child) => convertListItem(child as Block, options, depth, undefined))
    .join("\n");
}

/**
 * Convert ordered list
 */
function convertOrderedList(
  node: Block,
  options: MarkdownOptions,
  depth: number
): string {
  if (!Array.isArray(node.content)) return "";

  return node.content
    .map((child, index) =>
      convertListItem(child as Block, options, depth, index + 1)
    )
    .join("\n");
}

/**
 * Convert list item
 */
function convertListItem(
  node: Block,
  options: MarkdownOptions,
  depth: number,
  index?: number
): string {
  if (!node || typeof node !== "object") return "";

  const indent = "  ".repeat(depth);
  const prefix = index !== undefined ? `${index}.` : "-";

  if (!Array.isArray(node.content)) {
    return `${indent}${prefix} `;
  }

  const content = node.content
    .map((child) => {
      const childNode = child as any;
      if (
        childNode.nodeType === BLOCKS.UL_LIST ||
        childNode.nodeType === BLOCKS.OL_LIST
      ) {
        return "\n" + convertNode(child, options, depth + 1);
      }
      return convertNode(child, options, depth);
    })
    .join("");

  return `${indent}${prefix} ${content.trim()}`;
}

/**
 * Convert hyperlink
 */
function convertHyperlink(
  node: Inline,
  options: MarkdownOptions,
  depth: number
): string {
  try {
    const href = node.data?.uri || "";
    if (!href) {
      return processContent(node, options, depth);
    }

    const text = processContent(node, options, depth) || "link";
    return `[${text}](${href})`;
  } catch (error) {
    console.warn("Error converting hyperlink:", error);
    return "";
  }
}

/**
 * Convert embedded asset
 */
function convertEmbeddedAsset(node: Block): string {
  try {
    const target = node.data?.target;
    if (!target) return "";

    const title = target.fields?.title || "Asset";
    const url = target.fields?.file?.url || "";

    if (!url) return `![${title}]()`;

    return `![${title}](${url})`;
  } catch (error) {
    console.warn("Error converting embedded asset:", error);
    return "";
  }
}

/**
 * Convert text node with marks
 */
function convertText(node: Text): string {
  if (!node || typeof node.value !== "string") {
    return "";
  }

  let value = node.value;

  // Apply marks in reverse order to handle nested marks properly
  if (Array.isArray(node.marks) && node.marks.length > 0) {
    // Group marks by type for better handling
    const marksByType = new Map<string, (typeof node.marks)[0]>();

    node.marks.forEach((mark) => {
      marksByType.set(mark.type, mark);
    });

    // Apply marks in consistent order
    if (marksByType.has(MARKS.BOLD)) {
      value = `**${value}**`;
    }
    if (marksByType.has(MARKS.ITALIC)) {
      value = `*${value}*`;
    }
    if (marksByType.has(MARKS.CODE)) {
      value = `\`${value}\``;
    }
    // MARKS.UNDERLINE is not standard Markdown, so it's skipped
  }

  return value;
}
