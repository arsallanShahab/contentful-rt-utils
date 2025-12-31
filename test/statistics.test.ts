import { describe, it, expect } from "vitest";
import {
    getReadingTime,
    getWordCount,
    extractLinks,
} from "../src/lib/statistics";
import { Document, BLOCKS, INLINES } from "@contentful/rich-text-types";

const mockDocument: Document = {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: [
        {
            nodeType: BLOCKS.PARAGRAPH,
            data: {},
            content: [
                {
                    nodeType: "text",
                    value: "Hello world. This is a test document.",
                    marks: [],
                    data: {},
                },
            ],
        },
        {
            nodeType: BLOCKS.PARAGRAPH,
            data: {},
            content: [
                {
                    nodeType: "text",
                    value: "Check out ",
                    marks: [],
                    data: {},
                },
                {
                    nodeType: INLINES.HYPERLINK,
                    data: { uri: "https://example.com" },
                    content: [
                        {
                            nodeType: "text",
                            value: "this link",
                            marks: [],
                            data: {},
                        },
                    ],
                },
                {
                    nodeType: "text",
                    value: " and ",
                    marks: [],
                    data: {},
                },
                {
                    nodeType: INLINES.HYPERLINK,
                    data: { uri: "https://google.com" },
                    content: [
                        {
                            nodeType: "text",
                            value: "another one",
                            marks: [],
                            data: {},
                        },
                    ],
                },
                {
                    nodeType: "text",
                    value: ".",
                    marks: [],
                    data: {},
                },
            ],
        },
    ],
};

describe("Content Statistics", () => {
    describe("getWordCount", () => {
        it("should count words correctly", () => {
            // "Hello world. This is a test document." = 7 words
            // "Check out this link and another one." = 7 words
            // Total = 14 words
            expect(getWordCount(mockDocument)).toBe(14);
        });

        it("should return 0 for null document", () => {
            expect(getWordCount(null)).toBe(0);
        });

        it("should return 0 for empty document", () => {
            const emptyDoc: Document = {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [],
            };
            expect(getWordCount(emptyDoc)).toBe(0);
        });
    });

    describe("getReadingTime", () => {
        it("should calculate reading time correctly with default speed", () => {
            // 14 words / 200 wpm = 0.07 mins -> ceil -> 1 min
            expect(getReadingTime(mockDocument)).toBe(1);
        });

        it("should calculate reading time correctly with custom speed", () => {
            // 14 words / 10 wpm = 1.4 mins -> ceil -> 2 mins
            expect(getReadingTime(mockDocument, 10)).toBe(2);
        });
    });

    describe("extractLinks", () => {
        it("should extract all external URLs", () => {
            const links = extractLinks(mockDocument);
            expect(links).toHaveLength(2);
            expect(links).toContain("https://example.com");
            expect(links).toContain("https://google.com");
        });

        it("should return empty array if no links found", () => {
            const noLinkDoc: Document = {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                    {
                        nodeType: BLOCKS.PARAGRAPH,
                        data: {},
                        content: [
                            {
                                nodeType: "text",
                                value: "No links here.",
                                marks: [],
                                data: {},
                            },
                        ],
                    },
                ],
            };
            expect(extractLinks(noLinkDoc)).toHaveLength(0);
        });
    });
});
