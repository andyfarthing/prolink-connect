declare module 'esbuild-plugin-kaitai/dist/index.js' {
  import KaitaiStructCompiler from 'kaitai-struct-compiler';

  interface KaitaiOptions {
    compiler?: KaitaiStructCompiler;
    files?: string[];
    outDir?: string;
  }

  export function kaitaiLoader(options?: KaitaiOptions): {
    name: string;
    setup: (build: any) => void;
  };
}
