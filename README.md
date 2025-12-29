# Contentful Rich Text Utils

A robust, open-source TypeScript library to minify and convert Contentful Rich Text Documents. This library provides utilities to optimize Rich Text JSON for SSG builds and convert Rich Text to Markdown.

## Features

- **Minification**: Removes unused metadata from Rich Text nodes.
- **Markdown Conversion**: Converts Rich Text JSON to Markdown string.
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
});
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
