# Release v1.2.0

## 🚀 New Features

### Plain Text Conversion
- **`toPlainText(document, options)`**: Convert Rich Text to a plain text string. Useful for generating meta descriptions, search indices, or reading time estimates.
  - Supports custom separators.
  - Option to ignore link text.

### Table Generation
- **`createTable(data)`**: Programmatically create Contentful Rich Text Tables from 2D arrays.
  - Automatically handles header rows.
  - Simplifies table creation logic.

## 🛠 Improvements
- Added `toPlainText` and `createTable` to the public API exports.
