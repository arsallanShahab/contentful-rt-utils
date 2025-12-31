# Release v1.1.0

## 🚀 New Features

### Content Statistics
- **`getReadingTime(document)`**: Calculate estimated reading time.
- **`getWordCount(document)`**: Get accurate word count excluding HTML and metadata.
- **`extractLinks(document)`**: Extract all external URLs from the document.

### Sanitization & Cleanup
- **`removeEmptyNodes(document)`**: Recursively remove empty paragraphs that cause layout gaps.
- **`stripMarks(document, marks)`**: Programmatically remove formatting marks (e.g., bold, italic).

### Extraction Utilities
- **`getLinkedEntries(document)`**: Get a list of all referenced Entry IDs.
- **`getLinkedAssets(document)`**: Get a list of all referenced Asset IDs.

### Markdown Enhancements
- **Custom Renderers**: Support for custom rendering logic for specific node types.
- **Frontmatter Generation**: Option to generate YAML frontmatter (title, description, etc.) along with the Markdown output.

## 🛠 Improvements
- Enhanced type definitions for better TypeScript support.
- Improved robustness of Markdown conversion.
