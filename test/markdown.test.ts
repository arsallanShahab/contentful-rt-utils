import { describe, it, expect } from "vitest";
import { richTextToMarkdown } from "../src/lib/markdown";
import { Document, BLOCKS, INLINES } from "@contentful/rich-text-types";

describe("Rich Text to Markdown", () => {
  const mockDoc: Document = {
    nodeType: BLOCKS.DOCUMENT,
    data: {},
    content: [
      {
        nodeType: BLOCKS.HEADING_1,
        data: {},
        content: [
          {
            nodeType: "text",
            value: "My Title",
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
            value: "This is a description.",
            marks: [],
            data: {},
          },
        ],
      },
    ],
  };

  describe("Frontmatter Generation", () => {
    it("should generate frontmatter with extracted title and description", () => {
      const markdown = richTextToMarkdown(mockDoc, {
        frontmatter: {},
      });

      expect(markdown).toContain("---");
      expect(markdown).toContain('title: "My Title"');
      expect(markdown).toContain('description: "This is a description."');
      expect(markdown).toContain("# My Title");
    });

    it("should use provided frontmatter values", () => {
      const markdown = richTextToMarkdown(mockDoc, {
        frontmatter: {
          title: "Custom Title",
          author: "John Doe",
        },
      });

      expect(markdown).toContain('title: "Custom Title"');
      expect(markdown).toContain('author: "John Doe"');
      // Should still contain extracted description if not provided
      expect(markdown).toContain('description: "This is a description."');
    });
  });

  describe("Custom Renderers", () => {
    it("should use custom renderer for specific node type", () => {
      const markdown = richTextToMarkdown(mockDoc, {
        customRenderer: {
          [BLOCKS.HEADING_1]: (node, next) => {
            const content = (node as any).content.map(next).join("");
            return `<h1>${content}</h1>`;
          },
        },
      });

      expect(markdown).toContain("<h1>My Title</h1>");
      expect(markdown).not.toContain("# My Title");
    });
  });
});
