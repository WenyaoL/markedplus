import { Lexer } from './Lexer';
import { Parser } from './Parser';
import { Tokenizer } from './Tokenizer';
import { Renderer } from './Renderer';
import { TextRenderer } from './TextRenderer';
import { Slugger } from './Slugger';
import {
  merge,
  checkSanitizeDeprecation,
  escape
} from './helpers';
import {
  getDefaults,
} from './defaults';
import { MarkedOptions, MarkedExtension, RendererExtension, TokenizerExtension, MarkedRenderer, MarkedParser } from './type';



export class Marked {

  public parser: MarkedParser<any>;
  public defaults: MarkedOptions;
  public static Parser: typeof Parser  = Parser;
  public static Lexer: typeof Lexer  = Lexer;
  public static Renderer: typeof Renderer  = Renderer;
  public static Tokenizer: typeof Tokenizer  = Tokenizer;
  public static TextRenderer = TextRenderer;

  public static parse = Marked.Parser.parse;
  public static lex = Marked.Lexer.lex;
  public static lexer = Marked.Lexer.lex;

  constructor(opt: MarkedOptions) {
    this.defaults = merge({}, getDefaults(), opt || {});
    this.parser = new Parser(this.defaults)
  }

  setParser(parser:MarkedParser<any>){
    this.parser = parser || new Parser(this.defaults)
  }

  marked(src: string):string;
  marked(src: string, options: MarkedOptions):string;
  marked(src: string, options: MarkedOptions & { async: true }): Promise<string>;
  marked(src: string, callback: (error: any, parseResult: string) => void): void;
  marked(src: string, opt: MarkedOptions, callback: (error: any, parseResult: string) => void): void
  marked(src: string, options?: MarkedOptions|((error: any, parseResult: string) => void), callback?: (error: any, parseResult?: string) => void):void | string | Promise<string> {
    const _this = this
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }

    if (typeof options === 'function') {
      callback = options;
      options = null;
    }

    const opt = merge({}, this.defaults, options || {}) as MarkedOptions;
    checkSanitizeDeprecation(opt);
    
    if (callback) {
      const highlight = opt.highlight;
      let tokens;

      try {
        tokens = Lexer.lex(src, opt);
      } catch (e) {
        return callback(e);
      }

      const done = function (err?: any) {
        let out;

        if (!err) {
          try {
            if (opt.walkTokens) {
              _this.walkTokens(tokens, opt.walkTokens);
            }
            out = _this.parser.parse(tokens,true,opt)
          } catch (e) {
            err = e;
          }
        }

        opt.highlight = highlight;

        return err
          ? callback(err)
          : callback(null, out);
      };

      if (!highlight || highlight.length < 3) {
        return done();
      }

      delete opt.highlight;

      if (!tokens.length) return done();

      let pending = 0;
      this.walkTokens(tokens, function (token) {
        if (token.type === 'code') {
          pending++;
          setTimeout(() => {
            highlight(token.text, token.lang, function (err, code) {
              if (err) {
                return done(err);
              }
              if (code != null && code !== token.text) {
                token.text = code;
                token.escaped = true;
              }

              pending--;
              if (pending === 0) {
                done();
              }
            });
          }, 0);
        }
      });

      if (pending === 0) {
        done();
      }

      return;
    }

    function onError(e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if (opt.silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }

    try {
      const tokens = Lexer.lex(src, opt);
      if (opt.walkTokens) {
        if (opt.async) {
          return Promise.all(this.walkTokens(tokens, opt.walkTokens))
            .then(() => {
              return this.parser.parse(tokens,true,opt);
            })
            .catch(onError);
        }
        this.walkTokens(tokens, opt.walkTokens);
      }
      return this.parser.parse(tokens,true,opt);
    } catch (e) {
      onError(e);
    }
  }



  use(...args: MarkedExtension[]) {
    const extensions:any = this.defaults.extensions || { renderers: {}, childTokens: {} };

    args.forEach((pack) => {
      // copy options to new object
      const opts = merge({}, pack);

      // set async to true if it was set to true before
      opts.async = this.defaults.async || opts.async;

      // ==-- Parse "add on" extensions --== //
      if (pack.extensions) {
        pack.extensions.forEach((ext:TokenizerExtension & RendererExtension) => {
          if (!ext.name) {
            throw new Error('extension name required');
          }
          if (ext.renderer) { // Renderer extensions
            const prevRenderer = extensions.renderers[ext.name];
            if (prevRenderer) {
              // Replace extension with func to run new extension but fall back if false
              extensions.renderers[ext.name] = function (...args) {
                let ret = ext.renderer.apply(this, args);
                if (ret === false) {
                  ret = prevRenderer.apply(this, args);
                }
                return ret;
              };
            } else {
              extensions.renderers[ext.name] = ext.renderer;
            }
          }
          if (ext.tokenizer) { // Tokenizer Extensions
            if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
              throw new Error("extension level must be 'block' or 'inline'");
            }
            if (extensions[ext.level]) {
              extensions[ext.level].unshift(ext.tokenizer);
            } else {
              extensions[ext.level] = [ext.tokenizer];
            }
            if (ext.start) { // Function to check for start of token
              if (ext.level === 'block') {
                if (extensions.startBlock) {
                  extensions.startBlock.push(ext.start);
                } else {
                  extensions.startBlock = [ext.start];
                }
              } else if (ext.level === 'inline') {
                if (extensions.startInline) {
                  extensions.startInline.push(ext.start);
                } else {
                  extensions.startInline = [ext.start];
                }
              }
            }
          }
          if (ext.childTokens) { // Child tokens to be visited by walkTokens
            extensions.childTokens[ext.name] = ext.childTokens;
          }
        });
        opts.extensions = extensions;
      }

      // ==-- Parse "overwrite" extensions --== //
      if (pack.renderer) {
        const renderer = this.defaults.renderer || new Renderer(this.defaults);
        for (const prop in pack.renderer) {
          const prevRenderer = renderer[prop];
          // Replace renderer with func to run extension, but fall back if false
          renderer[prop] = (...args) => {
            let ret = pack.renderer[prop].apply(renderer, args);
            if (ret === false) {
              ret = prevRenderer.apply(renderer, args);
            }
            return ret;
          };
        }
        opts.renderer = renderer;
      }
      if (pack.tokenizer) {
        const tokenizer = this.defaults.tokenizer || new Tokenizer(this.defaults);
        for (const prop in pack.tokenizer) {
          const prevTokenizer = tokenizer[prop];
          // Replace tokenizer with func to run extension, but fall back if false
          tokenizer[prop] = (...args) => {
            let ret = pack.tokenizer[prop].apply(tokenizer, args);
            if (ret === false) {
              ret = prevTokenizer.apply(tokenizer, args);
            }
            return ret;
          };
        }
        opts.tokenizer = tokenizer;
      }

      // ==-- Parse WalkTokens extensions --== //
      if (pack.walkTokens) {
        const walkTokens = this.defaults.walkTokens;
        opts.walkTokens = function (token) {
          let values = [];
          values.push(pack.walkTokens.call(this, token));
          if (walkTokens) {
            values = values.concat(walkTokens.call(this, token));
          }
          return values;
        };
      }

      this.setOptions(opts)
    });
  }

  setOptions(opt: MarkedOptions) {
    merge(this.defaults, opt);
    return this.defaults;
  }

  walkTokens(tokens: any[], callback: { (token: any): void; call?: any; }) {
    let values = [];
    for (const token of tokens) {
      values = values.concat(callback.call(this, token));
      switch (token.type) {
        case 'table': {
          for (const cell of token.header) {
            values = values.concat(this.walkTokens(cell.tokens, callback));
          }
          for (const row of token.rows) {
            for (const cell of row) {
              values = values.concat(this.walkTokens(cell.tokens, callback));
            }
          }
          break;
        }
        case 'list': {
          values = values.concat(this.walkTokens(token.items, callback));
          break;
        }
        default: {
          if (this.defaults.extensions && this.defaults.extensions.childTokens && this.defaults.extensions.childTokens[token.type]) { // Walk any extensions
            this.defaults.extensions.childTokens[token.type].forEach(function (childTokens) {
              values = values.concat(this.walkTokens(token[childTokens], callback));
            });
          } else if (token.tokens) {
            values = values.concat(this.walkTokens(token.tokens, callback));
          }
        }
      }
    }
    return values;
  }


  parse(src: string):string;
  parse(src: string, opt: MarkedOptions):string;
  parse(src: string, opt: MarkedOptions & { async: true }): Promise<string>;
  parse(src: string, callback: (error: any, parseResult: string) => void): void;
  parse(src: string, opt: MarkedOptions, callback: (error: any, parseResult: string) => void): void
  parse(src: string, opt?: MarkedOptions|((error: any, parseResult: string) => void), callback?: (error: any, parseResult: string) => void):void | string | Promise<string> {
    return this.marked(src,opt as any,callback)
  }

  parseInline(src: string, opt: MarkedOptions) {
    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      throw new Error('marked.parseInline(): input parameter is undefined or null');
    }
    if (typeof src !== 'string') {
      throw new Error('marked.parseInline(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected');
    }

    opt = merge({}, this.defaults, opt || {});
    checkSanitizeDeprecation(opt);

    try {
      const tokens = Lexer.lexInline(src, opt);
      if (opt.walkTokens) {
        this.walkTokens(tokens, opt.walkTokens);
      }
      return this.parser.parseInline(tokens,null, opt);
    } catch (e) {
      e.message += '\nPlease report this to https://github.com/markedjs/marked.';
      if (opt.silent) {
        return '<p>An error occurred:</p><pre>'
          + escape(e.message + '', true)
          + '</pre>';
      }
      throw e;
    }
  }
}




export { getDefaults } from './defaults';
export { Lexer } from './Lexer';
export { Parser } from './Parser';
export { Tokenizer } from './Tokenizer';
export { Renderer } from './Renderer';
export { TextRenderer } from './TextRenderer';
export { Slugger } from './Slugger';