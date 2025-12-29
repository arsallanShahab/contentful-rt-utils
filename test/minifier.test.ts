import { describe, it, expect } from "vitest";
import { minifyRichText } from "../src/index";
import { Document, BLOCKS } from "@contentful/rich-text-types";

describe("minifyRichText", () => {
  it("should return null if document is null", () => {
    expect(minifyRichText(null)).toBeNull();
  });

  it("should minify a simple text document", () => {
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

    const result = minifyRichText(doc);
    expect(result).toEqual({
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
            },
          ],
        },
      ],
    });
  });

  it("should minify embedded entry with default fields", () => {
    const doc: any = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.EMBEDDED_ENTRY,
          data: {
            target: {
              sys: {
                id: "123",
                type: "Entry",
                contentType: { sys: { id: "post" } },
              },
              fields: {
                title: "My Post",
                slug: "my-post",
                body: "Some long content",
                unused: "data",
              },
            },
          },
          content: [],
        },
      ],
    };

    const result = minifyRichText(doc);
    expect(result?.content[0].data.target.fields).toEqual({
      title: "My Post",
      slug: "my-post",
    });
    expect(result?.content[0].data.target.fields.body).toBeUndefined();
  });

  it("should minify embedded asset with custom fields", () => {
    const doc: any = {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.EMBEDDED_ASSET,
          data: {
            target: {
              fields: {
                title: "My Image",
                file: {
                  url: "//images.ctfassets.net/img.jpg",
                  details: { size: 1000, image: { width: 100, height: 100 } },
                  fileName: "img.jpg",
                  contentType: "image/jpeg",
                },
              },
            },
          },
          content: [],
        },
      ],
    };

    const result = minifyRichText(doc, {
      keepAssetFields: ["title", "file.url", "file.details.size"],
    });

    expect(result?.content[0].data.target.fields).toEqual({
      title: "My Image",
      file: {
        url: "//images.ctfassets.net/img.jpg",
        details: {
          size: 1000,
        },
      },
    });
    expect(
      result?.content[0].data.target.fields.file.contentType
    ).toBeUndefined();
  });
});
