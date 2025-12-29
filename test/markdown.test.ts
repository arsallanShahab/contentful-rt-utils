import { describe, it, expect } from "vitest";
import { richTextToMarkdown } from "../src/index";
import { Document, BLOCKS, MARKS, INLINES } from "@contentful/rich-text-types";

describe("richTextToMarkdown", () => {
  it("converts simple paragraph with marks", () => {
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
              value: "Hello ",
              marks: [],
              data: {},
            },
            {
              nodeType: "text",
              value: "world",
              marks: [{ type: MARKS.BOLD }],
              data: {},
            },
            {
              nodeType: "text",
              value: "!",
              marks: [],
              data: {},
            },
          ],
        },
      ],
    };

    const markdown = richTextToMarkdown(doc);
    expect(markdown).toBe("Hello **world**!");
  });

  it("converts headings", () => {
    const doc: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.HEADING_1,
          data: {},
          content: [{ nodeType: "text", value: "Title", marks: [], data: {} }],
        },
        {
          nodeType: BLOCKS.HEADING_2,
          data: {},
          content: [
            { nodeType: "text", value: "Subtitle", marks: [], data: {} },
          ],
        },
      ],
    };

    const markdown = richTextToMarkdown(doc);
    expect(markdown).toBe("# Title\n\n## Subtitle");
  });

  it("converts unordered lists", () => {
    const doc: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.UL_LIST,
          data: {},
          content: [
            {
              nodeType: BLOCKS.LIST_ITEM,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.PARAGRAPH,
                  data: {},
                  content: [
                    { nodeType: "text", value: "Item 1", marks: [], data: {} },
                  ],
                },
              ],
            },
            {
              nodeType: BLOCKS.LIST_ITEM,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.PARAGRAPH,
                  data: {},
                  content: [
                    { nodeType: "text", value: "Item 2", marks: [], data: {} },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const markdown = richTextToMarkdown(doc);
    expect(markdown).toBe("- Item 1\n- Item 2");
  });

  it("converts ordered lists", () => {
    const doc: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.OL_LIST,
          data: {},
          content: [
            {
              nodeType: BLOCKS.LIST_ITEM,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.PARAGRAPH,
                  data: {},
                  content: [
                    { nodeType: "text", value: "First", marks: [], data: {} },
                  ],
                },
              ],
            },
            {
              nodeType: BLOCKS.LIST_ITEM,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.PARAGRAPH,
                  data: {},
                  content: [
                    { nodeType: "text", value: "Second", marks: [], data: {} },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const markdown = richTextToMarkdown(doc);
    expect(markdown).toBe("1. First\n2. Second");
  });

  it("converts nested lists", () => {
    const doc: Document = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.UL_LIST,
          data: {},
          content: [
            {
              nodeType: BLOCKS.LIST_ITEM,
              data: {},
              content: [
                {
                  nodeType: BLOCKS.PARAGRAPH,
                  data: {},
                  content: [
                    { nodeType: "text", value: "Parent", marks: [], data: {} },
                  ],
                },
                {
                  nodeType: BLOCKS.UL_LIST,
                  data: {},
                  content: [
                    {
                      nodeType: BLOCKS.LIST_ITEM,
                      data: {},
                      content: [
                        {
                          nodeType: BLOCKS.PARAGRAPH,
                          data: {},
                          content: [
                            {
                              nodeType: "text",
                              value: "Child",
                              marks: [],
                              data: {},
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const markdown = richTextToMarkdown(doc);
    expect(markdown).toBe("- Parent\n  - Child");
  });

  it("converts hyperlinks", () => {
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
              value: "Click ",
              marks: [],
              data: {},
            },
            {
              nodeType: INLINES.HYPERLINK,
              data: { uri: "https://example.com" },
              content: [
                {
                  nodeType: "text",
                  value: "here",
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
      ],
    };

    const markdown = richTextToMarkdown(doc);
    expect(markdown).toBe("Click [here](https://example.com)");
  });
});
