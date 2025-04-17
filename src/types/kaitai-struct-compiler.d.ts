declare module 'kaitai-struct-compiler' {
  interface CompilerOptions {
    targets?: string[];
    debug?: boolean;
    importRoot?: string[];
  }

  class KaitaiStructCompiler {
    constructor(options?: CompilerOptions);
    compile(ksy: string): Promise<Record<string, string>>;
  }

  export default KaitaiStructCompiler;
}
