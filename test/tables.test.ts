import { describe, it, expect } from "vitest";
import { createTable } from "../src/lib/tables";
import { BLOCKS, Table, TableRow, TableHeaderCell, TableCell, Paragraph, Text } from "@contentful/rich-text-types";

describe("createTable", () => {
    it("should create a table with header and data rows", () => {
        const data = [
            ["Name", "Role"],
            ["Alice", "Admin"],
            ["Bob", "User"],
        ];
        const table = createTable(data);

        expect(table.nodeType).toBe(BLOCKS.TABLE);
        expect(table.content).toHaveLength(3);

        // Check Header Row
        const headerRow = table.content[0] as TableRow;
        expect(headerRow.nodeType).toBe(BLOCKS.TABLE_ROW);
        expect(headerRow.content).toHaveLength(2);
        expect(headerRow.content[0].nodeType).toBe(BLOCKS.TABLE_HEADER_CELL);
        expect(((headerRow.content[0] as TableHeaderCell).content[0] as Paragraph).content[0]).toHaveProperty("value", "Name");

        // Check Data Row
        const dataRow = table.content[1] as TableRow;
        expect(dataRow.nodeType).toBe(BLOCKS.TABLE_ROW);
        expect(dataRow.content[0].nodeType).toBe(BLOCKS.TABLE_CELL);
        expect(((dataRow.content[0] as TableCell).content[0] as Paragraph).content[0]).toHaveProperty("value", "Alice");
    });

    it("should handle empty array", () => {
        const table = createTable([]);
        expect(table.nodeType).toBe(BLOCKS.TABLE);
        expect(table.content).toHaveLength(0);
    });
});
