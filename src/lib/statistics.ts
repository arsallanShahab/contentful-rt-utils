import { Document, Node, Text, INLINES } from "@contentful/rich-text-types";

/**
 * Calculate reading time for a Rich Text Document.
 * Assumes an average reading speed of 200 words per minute.
 *
 * @param document The Rich Text Document.
 * @param wordsPerMinute Average words per minute (default: 200).
 * @returns Reading time in minutes (rounded up).
 */
export function getReadingTime(
    document: Document | null,
    wordsPerMinute: number = 200
): number {
    if (!document) return 0;
    const wordCount = getWordCount(document);
    return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Get the total word count of a Rich Text Document, excluding HTML tags and metadata.
 *
 * @param document The Rich Text Document.
 * @returns Total word count.
 */
export function getWordCount(document: Document | null): number {
    if (!document) return 0;

    const text = extractText(document);
    const words = text.trim().split(/\s+/);
    // Filter out empty strings and punctuation-only strings (e.g. ".")
    return words.filter((word) => word.length > 0 && /[a-zA-Z0-9]/.test(word)).length;
}

/**
 * Extract all external URLs from a Rich Text Document.
 *
 * @param document The Rich Text Document.
 * @returns Array of external URLs.
 */
export function extractLinks(document: Document | null): string[] {
    if (!document) return [];
    const links: string[] = [];

    function findLinks(node: Node) {
        if (node.nodeType === INLINES.HYPERLINK) {
            if (node.data && node.data.uri) {
                links.push(node.data.uri);
            }
        }

        if ("content" in node && Array.isArray(node.content)) {
            node.content.forEach(findLinks);
        }
    }

    findLinks(document);
    return links;
}

/**
 * Helper to extract plain text from a node tree.
 */
function extractText(node: Node): string {
    if (node.nodeType === "text") {
        return (node as Text).value;
    }

    if ("content" in node && Array.isArray(node.content)) {
        return node.content.map(extractText).join(" ");
    }

    return "";
}
