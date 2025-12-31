import { Document, Node, BLOCKS, INLINES } from "@contentful/rich-text-types";

/**
 * Extract all referenced Entry IDs from the document.
 * Looks for EMBEDDED_ENTRY blocks and inlines.
 *
 * @param document The Rich Text Document.
 * @returns Array of Entry IDs.
 */
export function getLinkedEntries(document: Document | null): string[] {
    if (!document) return [];
    const entryIds: string[] = [];

    const findEntries = (node: Node) => {
        if (
            node.nodeType === BLOCKS.EMBEDDED_ENTRY ||
            node.nodeType === INLINES.EMBEDDED_ENTRY
        ) {
            if (node.data && node.data.target && node.data.target.sys && node.data.target.sys.id) {
                entryIds.push(node.data.target.sys.id);
            }
        }

        if ("content" in node && Array.isArray(node.content)) {
            node.content.forEach(findEntries);
        }
    };

    findEntries(document);
    // Return unique IDs
    return Array.from(new Set(entryIds));
}

/**
 * Extract all referenced Asset IDs from the document.
 * Looks for EMBEDDED_ASSET blocks.
 *
 * @param document The Rich Text Document.
 * @returns Array of Asset IDs.
 */
export function getLinkedAssets(document: Document | null): string[] {
    if (!document) return [];
    const assetIds: string[] = [];

    const findAssets = (node: Node) => {
        if (node.nodeType === BLOCKS.EMBEDDED_ASSET) {
            if (node.data && node.data.target && node.data.target.sys && node.data.target.sys.id) {
                assetIds.push(node.data.target.sys.id);
            }
        }

        if ("content" in node && Array.isArray(node.content)) {
            node.content.forEach(findAssets);
        }
    };

    findAssets(document);
    // Return unique IDs
    return Array.from(new Set(assetIds));
}
