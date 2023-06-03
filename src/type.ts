import { Lexer } from "./Lexer";
import { Parser } from "./Parser";
import { Renderer } from "./Renderer";
import { Slugger } from "./Slugger";
import { Tokenizer } from "./Tokenizer";

type RendererObject = Partial<Omit<Renderer, 'constructor' | 'options'>>;
type TokenizerObject = Partial<Omit<Tokenizer, 'constructor' | 'options'>>;

export interface MarkedExtension {
    /**
     * True will tell marked to await any walkTokens functions before parsing the tokens and returning an HTML string.
     */
    async?: boolean;

    /**
     * A prefix URL for any relative link.
     */
    baseUrl?: string | undefined;

    /**
     * Enable GFM line breaks. This option requires the gfm option to be true.
     */
    breaks?: boolean | undefined;

    /**
     * Add tokenizers and renderers to marked
     */
    extensions?:
    | TokenizerAndRendererExtension[] | any
    | undefined;

    /**
     * Enable GitHub flavored markdown.
     */
    gfm?: boolean | undefined;

    /**
     * Include an id attribute when emitting headings.
     */
    headerIds?: boolean | undefined;

    /**
     * Set the prefix for header tag ids.
     */
    headerPrefix?: string | undefined;

    /**
     * A function to highlight code blocks. The function can either be
     * synchronous (returning a string) or asynchronous (callback invoked
     * with an error if any occurred during highlighting and a string
     * if highlighting was successful)
     */
    highlight?(code: string, lang: string, callback?: (error: any, code?: string) => void): string | void;

    /**
     * Set the prefix for code block classes.
     */
    langPrefix?: string | undefined;

    /**
     * Mangle autolinks (<email@domain.com>).
     */
    mangle?: boolean | undefined;

    /**
     * Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
     */
    pedantic?: boolean | undefined;

    /**
     * Type: object Default: new Renderer()
     *
     * An object containing functions to render tokens to HTML.
     */
    renderer?: Renderer | RendererObject | undefined;

    /**
     * Sanitize the output. Ignore any HTML that has been input.
     */
    sanitize?: boolean | undefined;

    /**
     * Optionally sanitize found HTML with a sanitizer function.
     */
    sanitizer?(html: string): string;

    /**
     * Shows an HTML error message when rendering fails.
     */
    silent?: boolean | undefined;

    /**
     * Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
     */
    smartLists?: boolean | undefined;

    /**
     * Use "smart" typograhic punctuation for things like quotes and dashes.
     */
    smartypants?: boolean | undefined;

    /**
     * The tokenizer defines how to turn markdown text into tokens.
     */
    tokenizer?: Tokenizer | TokenizerObject | undefined;

    /**
     * The walkTokens function gets called with every token.
     * Child tokens are called before moving on to sibling tokens.
     * Each token is passed by reference so updates are persisted when passed to the parser.
     * The return value of the function is ignored.
     */
    walkTokens?: ((token: Token) => void) | undefined;
    /**
     * Generate closing slash for self-closing tags (<br/> instead of <br>)
     */
    xhtml?: boolean | undefined;
}

export interface MarkedOptions extends MarkedExtension {

    /**
     * Type: object Default: new Renderer()
     *
     * An object containing functions to render tokens to HTML.
     */
    renderer?: MarkedRenderer<any> | undefined;

    /**
     * The tokenizer defines how to turn markdown text into tokens.
     */
    tokenizer?: MarkedTokenizer<any> | undefined;
}

export interface RendererThis {
    parser: Parser;
}

export interface TokenizerThis {
    lexer: Lexer;
}

export type TokensList = Token[] & {
    links: {
        [key: string]: { href: string | null; title: string | null };
    };
};

export interface Rules {
    [ruleName: string]: RegExp | Rules;
}

export interface TokenizerExtension {
    name: string;
    level: 'block' | 'inline';
    start?: ((this: TokenizerThis, src: string) => number | void) | undefined;
    tokenizer: (this: TokenizerThis, src: string, tokens: Token[] | TokensList) => Tokens.Generic | void;
    childTokens?: string[] | undefined;
}

export interface RendererExtension {
    name: string;
    renderer: (this: RendererThis, token: Tokens.Generic) => string | false;
}

export type TokenizerAndRendererExtension = TokenizerExtension | RendererExtension | (TokenizerExtension & RendererExtension);

export interface MarkedParser<T = never>{
    parse(src: Token[] | TokensList,top:boolean, options?: MarkedOptions): T;
    parseInline(src: Token[], renderer?: Renderer, options?: MarkedOptions): T;
}

export interface MarkedTokenizer<T = never> {
    space(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Space | T;
    code(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Code | T;
    fences(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Code | T;
    heading(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Heading | T;
    hr(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Hr | T;
    blockquote(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Blockquote | T;
    list(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.List | T;
    html(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.HTML | T;
    def(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Def | T;
    table(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Table | T;
    lheading(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Heading | T;
    paragraph(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Paragraph | T;
    text(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Text | T;
    escape(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Escape | T;
    tag(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Tag | T;
    link(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Image | Tokens.Link | T;
    reflink(
        this: MarkedTokenizer & TokenizerThis,
        src: string,
        links: Tokens.Link[] | Tokens.Image[],
    ): Tokens.Link | Tokens.Image | Tokens.Text | T;
    emStrong(
        this: MarkedTokenizer & TokenizerThis,
        src: string,
        maskedSrc: string,
        prevChar: string,
    ): Tokens.Em | Tokens.Strong | T;
    codespan(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Codespan | T;
    br(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Br | T;
    del(this: MarkedTokenizer & TokenizerThis, src: string): Tokens.Del | T;
    autolink(this: MarkedTokenizer & TokenizerThis, src: string, mangle: (cap: string) => string): Tokens.Link | T;
    url(this: MarkedTokenizer & TokenizerThis, src: string, mangle: (cap: string) => string): Tokens.Link | T;
    inlineText(this: MarkedTokenizer & TokenizerThis, src: string, smartypants: (cap: string) => string): Tokens.Text | T;
}

export interface MarkedRenderer<T = never> {
    options: MarkedOptions;
    code(this: MarkedRenderer & RendererThis, code: string, language: string | undefined, isEscaped: boolean): string | T;
    blockquote(this: MarkedRenderer & RendererThis, quote: string): string | T;
    html(this: MarkedRenderer & RendererThis, html: string): string | T;
    heading(
        this: MarkedRenderer | RendererThis,
        text: string,
        level: 1 | 2 | 3 | 4 | 5 | 6,
        raw: string,
        slugger: Slugger,
    ): string | T;
    hr(this: MarkedRenderer & RendererThis): string | T;
    list(this: MarkedRenderer & RendererThis, body: string, ordered: boolean, start: number): string | T;
    listitem(this: MarkedRenderer & RendererThis, text: string, task: boolean, checked: boolean): string | T;
    checkbox(this: MarkedRenderer & RendererThis, checked: boolean): string | T;
    paragraph(this: MarkedRenderer & RendererThis, text: string): string | T;
    table(this: MarkedRenderer & RendererThis, header: string, body: string): string | T;
    tablerow(this: MarkedRenderer & RendererThis, content: string): string | T;
    tablecell(
        this: MarkedRenderer & RendererThis,
        content: string,
        flags: {
            header: boolean;
            align: 'center' | 'left' | 'right' | null;
        },
    ): string | T;
    strong(this: MarkedRenderer & RendererThis, text: string): string | T;
    em(this: MarkedRenderer & RendererThis, text: string): string | T;
    codespan(this: MarkedRenderer & RendererThis, code: string): string | T;
    br(this: MarkedRenderer & RendererThis): string | T;
    del(this: MarkedRenderer & RendererThis, text: string): string | T;
    link(this: MarkedRenderer & RendererThis, href: string | null, title: string | null, text: string): string | T;
    image(this: MarkedRenderer & RendererThis, href: string | null, title: string | null, text: string): string | T;
    text(this: MarkedRenderer & RendererThis, text: string): string | T;
}

export declare type Token =
    | Tokens.Space
    | Tokens.Code
    | Tokens.Heading
    | Tokens.Table
    | Tokens.Hr
    | Tokens.Blockquote
    | Tokens.List
    | Tokens.ListItem
    | Tokens.Paragraph
    | Tokens.HTML
    | Tokens.Text
    | Tokens.Def
    | Tokens.Escape
    | Tokens.Tag
    | Tokens.Image
    | Tokens.Link
    | Tokens.Strong
    | Tokens.Em
    | Tokens.Codespan
    | Tokens.Br
    | Tokens.Del;


export declare namespace Tokens {
    interface Space {
        type: 'space';
        raw: string;
    }

    interface Code {
        type: 'code';
        raw: string;
        codeBlockStyle?: 'indented' | undefined;
        lang?: string | undefined;
        text: string;
    }

    interface Heading {
        type: 'heading';
        raw: string;
        depth: number;
        text: string;
        tokens: Token[];
    }

    interface Table {
        type: 'table';
        raw: string;
        align: Array<'center' | 'left' | 'right' | null>;
        header: TableCell[];
        rows: TableCell[][];
    }

    interface TableCell {
        text: string;
        tokens: Token[];
    }

    interface Hr {
        type: 'hr';
        raw: string;
    }

    interface Blockquote {
        type: 'blockquote';
        raw: string;
        text: string;
        tokens: Token[];
    }

    interface List {
        type: 'list';
        raw: string;
        ordered: boolean;
        start: number | '';
        loose: boolean;
        items: ListItem[];
    }

    interface ListItem {
        type: 'list_item';
        raw: string;
        task: boolean;
        checked?: boolean | undefined;
        loose: boolean;
        text: string;
        tokens: Token[];
    }

    interface Paragraph {
        type: 'paragraph';
        raw: string;
        pre?: boolean | undefined;
        text: string;
        tokens: Token[];
    }

    interface HTML {
        type: 'html';
        raw: string;
        pre: boolean;
        text: string;
    }

    interface Text {
        type: 'text';
        raw: string;
        text: string;
        tokens?: Token[] | undefined;
    }

    interface Def {
        type: 'def';
        raw: string;
        tag: string;
        href: string;
        title: string;
    }

    interface Escape {
        type: 'escape';
        raw: string;
        text: string;
    }

    interface Tag {
        type: 'text' | 'html';
        raw: string;
        inLink: boolean;
        inRawBlock: boolean;
        text: string;
    }

    interface Link {
        type: 'link';
        raw: string;
        href: string;
        title: string;
        text: string;
        tokens: Token[];
    }

    interface Image {
        type: 'image';
        raw: string;
        href: string;
        title: string;
        text: string;
    }

    interface Strong {
        type: 'strong';
        raw: string;
        text: string;
        tokens: Token[];
    }

    interface Em {
        type: 'em';
        raw: string;
        text: string;
        tokens: Token[];
    }

    interface Codespan {
        type: 'codespan';
        raw: string;
        text: string;
    }

    interface Br {
        type: 'br';
        raw: string;
    }

    interface Del {
        type: 'del';
        raw: string;
        text: string;
        tokens: Token[];
    }

    interface Generic {
        [index: string]: any;
        type: string;
        raw: string;
        tokens?: Token[] | undefined;
    }
}