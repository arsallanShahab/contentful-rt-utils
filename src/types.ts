import { Document, Block, Inline, Text } from "@contentful/rich-text-types";

export type MinifyOptions = {
  /** list of field keys to keep for Entries (e.g. ['slug', 'title']) */
  keepEntryFields?: string[];
  /** list of field keys to keep for Assets (e.g. ['file.url', 'title']) */
  keepAssetFields?: string[];
  /** Optional callback for custom transformation of Entries */
  transformEntry?: (entry: any) => any;
  /** Optional callback for custom transformation of Assets */
  transformAsset?: (asset: any) => any;
};

export type RichTextNode = Block | Inline | Text;
