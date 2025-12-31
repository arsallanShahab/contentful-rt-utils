# Contentful Rich Text Utils

A robust, open-source TypeScript library to minify and convert Contentful Rich Text Documents. This library provides utilities to optimize Rich Text JSON for SSG builds and convert Rich Text to Markdown.

## Features

- **Minification**: Removes unused metadata from Rich Text nodes.
- **Markdown Conversion**: Converts Rich Text JSON to Markdown string with frontmatter support.
- **Content Statistics**: Calculate reading time, word count, and extract links.
- **Sanitization**: Remove empty nodes and strip unwanted formatting.
- **Plain Text**: Convert Rich Text to plain text string.
- **Table Generation**: Programmatically create Rich Text Tables from data arrays.
- **Extraction**: Get all referenced Entry and Asset IDs.
- **Configurable**: Specify exactly which fields to keep for embedded Entries and Assets.
- **Custom Transformations**: Provide custom callbacks for advanced transformation logic.
- **Type Safe**: Built with TypeScript and strict type definitions.
- **Immutable**: Returns a new deep copy of the document, leaving the original untouched.
- **Dot Notation Support**: Easily select nested fields (e.g., `file.url`).

## Motivation

When using Contentful with Next.js Static Site Generation (SSG), the raw Rich Text JSON returned by the API can be significantly large, especially when it contains many embedded assets and entries with full metadata. This bloated JSON increases the build size of your static pages (HTML/JSON props), leading to slower page loads and higher bandwidth usage.

`contentful-rt-utils` solves this by stripping away all the unused system metadata (`sys`, `metadata`, etc.) and allowing you to pick only the fields you actually need for rendering (e.g., just the image URL and title). This can drastically reduce the footprint of your SSG build artifacts.

## Installation

```bash
npm install contentful-rt-utils
# or
yarn add contentful-rt-utils
# or
pnpm add contentful-rt-utils
```

## Usage

### Minification

```typescript
import { minifyRichText } from "contentful-rt-utils";
import { Document } from "@contentful/rich-text-types";

const document: Document = {
  // ... your Contentful Rich Text Document
};

const minified = minifyRichText(document);
```

### Advanced Minification with Options

You can configure which fields to keep in embedded entries and assets, or provide custom transformation functions.

```typescript
import { minifyRichText } from "contentful-rt-utils";

const minified = minifyRichText(document, {
  // Keep specific fields for Entries
  keepEntryFields: ["title", "slug", "category"],

  // Keep specific fields for Assets (supports dot notation)
  keepAssetFields: ["title", "file.url", "file.details.size"],

  // Custom transformation for Entries (overrides keepEntryFields)
  transformEntry: (entry) => ({
    ...entry.fields,
    customProp: true,
  }),

  // Custom transformation for Assets (overrides keepAssetFields)
  transformAsset: (asset) => ({
    url: asset.fields.file.url,
    alt: asset.fields.title,
  }),
});
```

### Markdown Conversion

Convert Rich Text to a Markdown string.

```typescript
import { richTextToMarkdown } from "contentful-rt-utils";
import { Document } from "@contentful/rich-text-types";

const document: Document = {
  // ... your Contentful Rich Text Document
};

const markdown = richTextToMarkdown(document);
console.log(markdown);
```

You can also provide custom renderers for embedded entries and assets:

```typescript
const markdown = richTextToMarkdown(document, {
  renderAsset: (node) =>
    `![${node.data.target.fields.title}](${node.data.target.fields.file.url})`,
  renderEntry: (node) => `[Embedded Entry: ${node.data.target.fields.title}]`,
  // Generate frontmatter
  frontmatter: {
    author: "Arsallan",
  },
  // Custom renderer for specific nodes
  customRenderer: {
    [BLOCKS.EMBEDDED_ENTRY]: (node, next) => {
      return `<div class="embed">${next(node)}</div>`;
    }
  }
});
```

### Content Statistics

```typescript
import { getReadingTime, getWordCount, extractLinks } from 'contentful-rt-utils';

// Calculate reading time (default 200 wpm)
const minutes = getReadingTime(document);

// Get accurate word count (excludes HTML/metadata and punctuation)
const words = getWordCount(document);

// Extract all external URLs
const links = extractLinks(document);
```

### Sanitization & Cleanup

```typescript
import { removeEmptyNodes, stripMarks } from 'contentful-rt-utils';

// Recursively remove empty paragraphs
const cleanDoc = removeEmptyNodes(document);

// Strip specific formatting marks (e.g., remove all bold text)
const plainDoc = stripMarks(document, ['bold']);
```

### Extraction Utilities

```typescript
import { getLinkedEntries, getLinkedAssets } from 'contentful-rt-utils';

// Get all referenced Entry IDs
const entryIds = getLinkedEntries(document);

// Get all referenced Asset IDs
const assetIds = getLinkedAssets(document);
```

### Plain Text Conversion

```typescript
import { toPlainText } from 'contentful-rt-utils';

// Convert to plain text (default newline separator)
const text = toPlainText(document);

// Custom separator and ignore links
const summary = toPlainText(document, { 
  separator: ' ', 
  ignoreLinks: true 
});
```

### Table Generation

```typescript
import { createTable } from 'contentful-rt-utils';

const data = [
  ['Name', 'Role'], // First row becomes header
  ['Alice', 'Admin'],
  ['Bob', 'User']
];

const tableNode = createTable(data);
```

## API Reference

### `minifyRichText(document, options?)`

Minifies a Contentful Rich Text Document.

- **document**: `Document | null` - The Rich Text Document to minify.
- **options**: `MinifyOptions` (optional) - Configuration options.

#### `MinifyOptions`

| Property          | Type                  | Description                                                                                   |
| :---------------- | :-------------------- | :-------------------------------------------------------------------------------------------- |
| `keepEntryFields` | `string[]`            | List of field keys to keep for Entries (e.g., `['slug', 'title']`).                           |
| `keepAssetFields` | `string[]`            | List of field keys to keep for Assets (e.g., `['file.url', 'title']`). Supports dot notation. |
| `transformEntry`  | `(entry: any) => any` | Optional callback for custom transformation of Entries.                                       |
| `transformAsset`  | `(asset: any) => any` | Optional callback for custom transformation of Assets.                                        |

### `richTextToMarkdown(document, options?)`

Converts a Contentful Rich Text Document to a Markdown string.

- **document**: `Document | null` - The Rich Text Document to convert.
- **options**: `MarkdownOptions` (optional) - Configuration options.

#### `MarkdownOptions`

| Property      | Type                                | Description                           |
| :------------ | :---------------------------------- | :------------------------------------ |
| `renderEntry` | `(node: Block \| Inline) => string` | Custom renderer for embedded entries. |
| `renderAsset` | `(node: Block \| Inline) => string` | Custom renderer for embedded assets.  |

### `toPlainText(document, options?)`

Converts a Rich Text Document to a plain text string.

- **document**: `Document | Node | null`
- **options**: `PlainTextOptions`

| Property      | Type      | Default | Description                                      |
| :------------ | :-------- | :------ | :----------------------------------------------- |
| `separator`   | `string`  | `\n`    | String to join blocks with.                      |
| `ignoreLinks` | `boolean` | `false` | If true, excludes text content within hyperlinks. |

### `createTable(data)`

Creates a Rich Text Table node.

- **data**: `string[][]` - 2D array of strings. First row is treated as header.

## Development

### Build

```bash
npm run build
```

### Test

```bash
npm test
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.
