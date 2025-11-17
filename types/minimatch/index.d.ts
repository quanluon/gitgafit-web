declare module 'minimatch' {
  export interface IOptions {
    debug?: boolean;
    nobrace?: boolean;
    noglobstar?: boolean;
    dot?: boolean;
    noext?: boolean;
    nocase?: boolean;
    nonull?: boolean;
    matchBase?: boolean;
    nocomment?: boolean;
    nonegate?: boolean;
    flipNegate?: boolean;
    [key: string]: unknown;
  }

  function minimatch(path: string, pattern: string, options?: IOptions): boolean;

  namespace minimatch {
    function filter(pattern: string, options?: IOptions): (path: string) => boolean;
    function match(list: readonly string[], pattern: string, options?: IOptions): string[];
    function makeRe(pattern: string, options?: IOptions): RegExp | null;

    class Minimatch {
      constructor(pattern: string, options?: IOptions);
      pattern: string;
      options?: IOptions;
      comment: boolean;
      empty: boolean;
      negate: boolean;
      set: string[][];
      regexp: RegExp | null;
      makeRe(): RegExp | null;
      match(path: string): boolean;
    }
  }

  export = minimatch;
}

