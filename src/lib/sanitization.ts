import { Document, Node, Block, Inline, Text, BLOCKS } from "@contentful/rich-text-types";

/**
 * Recursively remove empty paragraphs from the document.
 * An empty paragraph is defined as one with no content or only empty text nodes.
 *
 * @param document The Rich Text Document.
 * @returns A new Document with empty paragraphs removed.
 */
export function removeEmptyNodes(document: Document): Document {
    if (!document) return document;

    const cleanContent = (content: Node[]): Node[] => {
        return content
            .map((node) => {
                if (isText(node)) {
                    return node;
                }

                // Recursively clean children
                const newNode = { ...node };
                if ("content" in newNode && Array.isArray(newNode.content)) {
                    newNode.content = cleanContent(newNode.content);
                }

                // Check if node is an empty paragraph
                if (newNode.nodeType === BLOCKS.PARAGRAPH) {
                    if (isEmptyParagraph(newNode as Block)) {
                        return null;
                    }
                }

                return newNode;
            })
            .filter((node): node is Node => node !== null);
    };

    return {
        ...document,
        content: cleanContent(document.content),
    } as Document;
}

/**
 * Strip specific formatting marks from the document.
 *
 * @param document The Rich Text Document.
 * @param marksToRemove Array of mark types to remove (e.g., ['bold', 'code']).
 * @returns A new Document with specified marks removed.
 */
export function stripMarks(document: Document, marksToRemove: string[]): Document {
    if (!document) return document;

    const cleanNode = (node: Node): Node => {
        if (isText(node)) {
            const textNode = { ...node } as Text;
            if (textNode.marks) {
                textNode.marks = textNode.marks.filter(
                    (mark) => !marksToRemove.includes(mark.type)
                );
            }
            return textNode;
        }

        if ("content" in node && Array.isArray(node.content)) {
            return {
                ...node,
                content: node.content.map(cleanNode),
            } as Node;
        }

        return node;
    };

    return cleanNode(document) as Document;
}

function isText(node: Node): node is Text {
    return node.nodeType === "text";
}

function isEmptyParagraph(node: Block): boolean {
    if (!node.content || node.content.length === 0) return true;
    return node.content.every((child) => {
        if (isText(child)) {
            return child.value.trim() === "";
        }
        return false;
    });
}
