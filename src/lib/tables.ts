import { BLOCKS, Table, TableRow, TableHeaderCell, TableCell, Paragraph, Text } from "@contentful/rich-text-types";

/**
 * Creates a Contentful Rich Text Table node from a 2D array of strings.
 * The first row is treated as the header row.
 *
 * @param data A 2D array of strings representing the table data.
 * @returns A Contentful Rich Text Table node.
 */
export function createTable(data: string[][]): Table {
    const tableRows: TableRow[] = data.map((row, rowIndex) => {
        const isHeader = rowIndex === 0;
        const CellType = isHeader ? BLOCKS.TABLE_HEADER_CELL : BLOCKS.TABLE_CELL;

        const cells = row.map((cellContent) => {
            const textNode: Text = {
                nodeType: "text",
                value: cellContent,
                marks: [],
                data: {},
            };

            const paragraphNode: Paragraph = {
                nodeType: BLOCKS.PARAGRAPH,
                data: {},
                content: [textNode],
            };

            const cellNode: TableHeaderCell | TableCell = {
                nodeType: CellType,
                data: {},
                content: [paragraphNode],
            };

            return cellNode;
        });

        const rowNode: TableRow = {
            nodeType: BLOCKS.TABLE_ROW,
            data: {},
            content: cells,
        };

        return rowNode;
    });

    const tableNode: Table = {
        nodeType: BLOCKS.TABLE,
        data: {},
        content: tableRows,
    };

    return tableNode;
}
