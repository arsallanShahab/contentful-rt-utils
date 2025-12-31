import { describe, it, expect } from "vitest";
import { getLinkedEntries, getLinkedAssets } from "../src/lib/extraction";
import { Document, BLOCKS, INLINES } from "@contentful/rich-text-types";

describe("Extraction Utilities", () => {
    const mockDoc: Document = {
        nodeType: BLOCKS.DOCUMENT,
        data: {},
        content: [
            {
                nodeType: BLOCKS.PARAGRAPH,
                data: {},
                content: [
                    {
                        nodeType: "text",
                        value: "Here is an entry:",
                        marks: [],
                        data: {},
                    },
                    {
                        nodeType: INLINES.EMBEDDED_ENTRY,
                        data: {
                            target: {
                                sys: { id: "entry-1", type: "Link", linkType: "Entry" },
                            },
                        },
                        content: [],
                    },
                ],
            },
            {
                nodeType: BLOCKS.EMBEDDED_ENTRY,
                data: {
                    target: {
                        sys: { id: "entry-2", type: "Link", linkType: "Entry" },
                    },
                },
                content: [],
            },
            {
                nodeType: BLOCKS.EMBEDDED_ASSET,
                data: {
                    target: {
                        sys: { id: "asset-1", type: "Link", linkType: "Asset" },
                    },
                },
                content: [],
            },
            {
                nodeType: BLOCKS.EMBEDDED_ASSET,
                data: {
                    target: {
                        sys: { id: "asset-1", type: "Link", linkType: "Asset" }, // Duplicate
                    },
                },
                content: [],
            },
        ],
    };

    describe("getLinkedEntries", () => {
        it("should extract all unique entry IDs", () => {
            const entries = getLinkedEntries(mockDoc);
            expect(entries).toHaveLength(2);
            expect(entries).toContain("entry-1");
            expect(entries).toContain("entry-2");
        });

        it("should return empty array if no entries", () => {
            const emptyDoc: Document = {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [],
            };
            expect(getLinkedEntries(emptyDoc)).toHaveLength(0);
        });
    });

    describe("getLinkedAssets", () => {
        it("should extract all unique asset IDs", () => {
            const assets = getLinkedAssets(mockDoc);
            expect(assets).toHaveLength(1);
            expect(assets).toContain("asset-1");
        });

        it("should return empty array if no assets", () => {
            const emptyDoc: Document = {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [],
            };
            expect(getLinkedAssets(emptyDoc)).toHaveLength(0);
        });
    });
});
