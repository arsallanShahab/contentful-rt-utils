import { describe, it, expect } from "vitest";
import { toPlainText } from "../src/lib/text";
import { Document, BLOCKS, INLINES } from "@contentful/rich-text-types";

describe("toPlainText", () => {
    it("should return empty string for null/undefined", () => {
        expect(toPlainText(null)).toBe("");
        expect(toPlainText(undefined)).toBe("");
    });

    it("should convert simple paragraph to text", () => {
        const doc: Document = {
            nodeType: BLOCKS.DOCUMENT,
            data: {},
            content: [
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                        {
                            nodeType: "text",
                            value: "Hello World",
                            marks: [],
                            data: {},
                        },
                    ],
                },
            ],
        };
        expect(toPlainText(doc)).toBe("Hello World");
    });

    it("should join paragraphs with newline by default", () => {
        const doc: Document = {
            nodeType: BLOCKS.DOCUMENT,
            data: {},
            content: [
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [{ nodeType: "text", value: "Line 1", marks: [], data: {} }],
                },
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [{ nodeType: "text", value: "Line 2", marks: [], data: {} }],
                },
            ],
        };
        expect(toPlainText(doc)).toBe("Line 1\nLine 2");
    });

    it("should use custom separator", () => {
        const doc: Document = {
            nodeType: BLOCKS.DOCUMENT,
            data: {},
            content: [
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [{ nodeType: "text", value: "A", marks: [], data: {} }],
                },
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [{ nodeType: "text", value: "B", marks: [], data: {} }],
                },
            ],
        };
        expect(toPlainText(doc, { separator: " " })).toBe("A B");
    });

    it("should handle nested blocks (Quote)", () => {
        const doc: Document = {
            nodeType: BLOCKS.DOCUMENT,
            data: {},
            content: [
                {
                    nodeType: BLOCKS.QUOTE,
                    data: {},
                    content: [
                        {
                            nodeType: BLOCKS.PARAGRAPH,
                            data: {},
                            content: [{ nodeType: "text", value: "Quote line 1", marks: [], data: {} }],
                        },
                        {
                            nodeType: BLOCKS.PARAGRAPH,
                            data: {},
                            content: [{ nodeType: "text", value: "Quote line 2", marks: [], data: {} }],
                        },
                    ],
                },
            ],
        };
        expect(toPlainText(doc)).toBe("Quote line 1\nQuote line 2");
    });

    it("should handle links correctly (default: include text)", () => {
        const doc: Document = {
            nodeType: BLOCKS.DOCUMENT,
            data: {},
            content: [
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                        { nodeType: "text", value: "Click ", marks: [], data: {} },
                        {
                            nodeType: INLINES.HYPERLINK,
                            data: { uri: "https://example.com" },
                            content: [{ nodeType: "text", value: "here", marks: [], data: {} }],
                        },
                        { nodeType: "text", value: " to read.", marks: [], data: {} },
                    ],
                },
            ],
        };
        expect(toPlainText(doc)).toBe("Click here to read.");
    });

    it("should ignore links if ignoreLinks is true", () => {
        const doc: Document = {
            nodeType: BLOCKS.DOCUMENT,
            data: {},
            content: [
                {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                        { nodeType: "text", value: "Click ", marks: [], data: {} },
                        {
                            nodeType: INLINES.HYPERLINK,
                            data: { uri: "https://example.com" },
                            content: [{ nodeType: "text", value: "here", marks: [], data: {} }],
                        },
                        { nodeType: "text", value: " to read.", marks: [], data: {} },
                    ],
                },
            ],
        };
        expect(toPlainText(doc, { ignoreLinks: true })).toBe("Click  to read.");
    });
});
