declare module 'mammoth' {
  export interface ConvertResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export interface ConvertOptions {
    styleMap?: string[] | string;
    includeDefaultStyleMap?: boolean;
    convertImage?: any;
    [key: string]: any;
  }

  export function convertToHtml(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string },
    options?: ConvertOptions
  ): Promise<ConvertResult>;

  export function extractRawText(
    input: { arrayBuffer: ArrayBuffer } | { buffer: Buffer } | { path: string }
  ): Promise<ConvertResult>;
}
