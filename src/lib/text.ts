import { Document, Node, BLOCKS, INLINES, Text } from "@contentful/rich-text-types";

export interface PlainTextOptions {
    /**
     * String to use when joining block elements.
     * @default "\n"
     */
    separator?: string;
    /**
     * If true, text content within links (INLINES.HYPERLINK, INLINES.ASSET_HYPERLINK, INLINES.ENTRY_HYPERLINK) will be excluded.
     * @default false
     */
    ignoreLinks?: boolean;
}

/**
 * Converts a Contentful Rich Text Document or Node into a plain text string.
 *
 * @param node The Rich Text Document or Node.
 * @param options Conversion options.
 * @returns The plain text representation.
 */
export function toPlainText(
    node: Document | Node | null | undefined,
    options: PlainTextOptions = {}
): string {
    if (!node) {
        return "";
    }

    const { separator = "\n", ignoreLinks = false } = options;

    if (node.nodeType === "text") {
        return (node as Text).value;
    }

    if (ignoreLinks && (
        node.nodeType === INLINES.HYPERLINK ||
        node.nodeType === INLINES.ASSET_HYPERLINK ||
        node.nodeType === INLINES.ENTRY_HYPERLINK
    )) {
        return "";
    }

    if ("content" in node && Array.isArray(node.content)) {
        // Determine if this node is a container of blocks
        const isBlockContainer = [
            BLOCKS.DOCUMENT,
            BLOCKS.QUOTE,
            BLOCKS.UL_LIST,
            BLOCKS.OL_LIST,
            BLOCKS.LIST_ITEM,
            BLOCKS.TABLE,
            BLOCKS.TABLE_ROW,
            BLOCKS.TABLE_CELL,
            BLOCKS.TABLE_HEADER_CELL
        ].includes(node.nodeType as any);

        const childContent = node.content
            .map((child) => toPlainText(child, options))
            .filter(Boolean) // Remove empty strings to avoid extra separators
            .join(isBlockContainer ? separator : "");

        return childContent;
    }

    return "";
}
