import { describe, it, expect } from "vitest";
import { removeEmptyNodes, stripMarks } from "../src/lib/sanitization";
import { Document, BLOCKS, MARKS } from "@contentful/rich-text-types";

describe("Sanitization & Cleanup", () => {
    describe("removeEmptyNodes", () => {
        it("should remove empty paragraphs", () => {
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
                                value: "Keep me",
                                marks: [],
                                data: {},
                            },
                        ],
                    },
                    {
                        nodeType: BLOCKS.PARAGRAPH, // Empty content array
                        data: {},
                        content: [],
                    },
                    {
                        nodeType: BLOCKS.PARAGRAPH, // Only whitespace text
                        data: {},
                        content: [
                            {
                                nodeType: "text",
                                value: "   ",
                                marks: [],
                                data: {},
                            },
                        ],
                    },
                ],
            };

            const cleaned = removeEmptyNodes(doc);
            expect(cleaned.content).toHaveLength(1);
            expect((cleaned.content[0] as any).content[0].value).toBe("Keep me");
        });

        it("should keep paragraphs with non-text content (e.g. embedded entry)", () => {
            const doc: Document = {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                    {
                        nodeType: BLOCKS.PARAGRAPH,
                        data: {},
                        content: [
                            {
                                nodeType: BLOCKS.EMBEDDED_ENTRY,
                                data: { target: { sys: { id: "123" } } },
                                content: [],
                            },
                        ],
                    },
                ],
            };

            const cleaned = removeEmptyNodes(doc);
            expect(cleaned.content).toHaveLength(1);
        });
    });

    describe("stripMarks", () => {
        it("should remove specified marks", () => {
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
                                value: "Bold Text",
                                marks: [{ type: MARKS.BOLD }],
                                data: {},
                            },
                            {
                                nodeType: "text",
                                value: "Italic Text",
                                marks: [{ type: MARKS.ITALIC }],
                                data: {},
                            },
                        ],
                    },
                ],
            };

            const cleaned = stripMarks(doc, [MARKS.BOLD]);
            const p = cleaned.content[0] as any;
            expect(p.content[0].marks).toHaveLength(0); // Bold removed
            expect(p.content[1].marks).toHaveLength(1); // Italic kept
            expect(p.content[1].marks[0].type).toBe(MARKS.ITALIC);
        });
    });
});
