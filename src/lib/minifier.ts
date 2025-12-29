import { Document, Block, Inline, Text } from "@contentful/rich-text-types";
import { MinifyOptions, RichTextNode } from "../types";
import { pick } from "./helpers";

/**
 * Minifies a Contentful Rich Text Document.
 * Removes unused metadata and fields from embedded assets/entries.
 *
 * @param document The Rich Text Document to minify.
 * @param options Configuration options for minification.
 * @returns A new minified Document or null if input is invalid.
 */
export function minifyRichText(
  document: Document | null,
  options: MinifyOptions = {}
): Document | null {
  if (!document) return null;

  return {
    nodeType: document.nodeType,
    data: document.data,
    content: document.content.map((node) => minifyNode(node, options)),
  } as Document;
}

/**
 * Recursively minifies a Rich Text Node.
 *
 * @param node The node to minify.
 * @param options Configuration options.
 * @returns The minified node.
 */
function minifyNode(node: RichTextNode, options: MinifyOptions): RichTextNode {
  // Create a shallow copy to avoid mutation, but we will rebuild content/data
  const minifiedNode: any = {
    nodeType: node.nodeType,
    data: {},
    content: [],
  };

  // Handle Text nodes
  if (node.nodeType === "text") {
    minifiedNode.value = (node as Text).value;
    minifiedNode.marks = (node as Text).marks;
    // Text nodes don't have content or data
    delete minifiedNode.content;
    delete minifiedNode.data;
    return minifiedNode as Text;
  }

  // Handle Data (Embedded Assets/Entries)
  if (node.data) {
    // Start with a shallow copy of data
    minifiedNode.data = { ...node.data };

    // Minify target if it exists (Embedded Asset/Entry)
    if (minifiedNode.data.target) {
      const target = minifiedNode.data.target;

      // Check if it's an Asset or Entry based on sys.type or fields presence
      // We'll use a heuristic: if it has fields.file, it's likely an Asset.
      // Or we can check sys.linkType or sys.type if available, but often in resolved RT, we just have fields.

      const isAsset = target.fields && target.fields.file;
      // If it's not clearly an asset, treat as entry (or if we can't tell, we might default to entry logic or just keep as is)

      if (isAsset) {
        if (options.transformAsset) {
          minifiedNode.data.target = options.transformAsset(target);
        } else if (options.keepAssetFields) {
          minifiedNode.data.target = {
            fields: pick(target.fields, options.keepAssetFields),
          };
          // Preserve sys info if needed? Usually minification implies stripping sys unless requested.
          // The spec says "remove unused metadata", so we default to stripping sys unless we want to keep it.
          // But for now, let's assume we just replace target with the filtered fields structure.
          // Wait, if we replace target with just fields, we might break structure if the consumer expects { sys, fields }.
          // The prompt example showed:
          // minifiedNode.data.target = { fields: { ... } };
          // So we will follow that structure.
        } else {
          // Default Asset Minification if no options provided?
          // The prompt example had a default behavior.
          // "Usually we can check fields.file for Asset" -> keep title, file.url, file.contentType
          minifiedNode.data.target = {
            fields: {
              title: target.fields.title,
              file: {
                url: target.fields.file?.url,
                contentType: target.fields.file?.contentType,
                details: target.fields.file?.details, // Keep details often useful
                fileName: target.fields.file?.fileName,
              },
              description: target.fields.description,
            },
          };
        }
      } else {
        // Entry
        if (options.transformEntry) {
          minifiedNode.data.target = options.transformEntry(target);
        } else if (options.keepEntryFields) {
          minifiedNode.data.target = {
            fields: pick(target.fields, options.keepEntryFields),
          };
        } else {
          // Default Entry Minification
          // "We only need title and slug for links"
          minifiedNode.data.target = {
            fields: {
              title: target.fields?.title,
              slug: target.fields?.slug,
              // Maybe keep other common fields?
            },
          };

          // If sys.contentType is present, it's often useful to keep it to know what kind of entry it is
          if (target.sys && target.sys.contentType) {
            minifiedNode.data.target.sys = {
              contentType: target.sys.contentType,
            };
          }
        }
      }
    }
  }

  // Recursively minify content
  if ((node as Block | Inline).content) {
    minifiedNode.content = (node as Block | Inline).content.map(
      (child: RichTextNode) => minifyNode(child, options)
    );
  }

  return minifiedNode as Block | Inline;
}
