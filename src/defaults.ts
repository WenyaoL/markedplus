import { MarkedOptions } from "./type";

export function getDefaults(): MarkedOptions {
  return {
    async: false,
    baseUrl: null,
    breaks: false,
    extensions: null,
    gfm: true,
    headerIds: true,
    headerPrefix: '',
    highlight: null,
    langPrefix: 'language-',
    mangle: true,
    pedantic: false,
    renderer: null,
    sanitize: false,
    sanitizer: null,
    silent: false,
    smartypants: false,
    tokenizer: null,
    walkTokens: null,
    xhtml: false
  };
}

export let defaults: MarkedOptions = getDefaults();

export function changeDefaults(newDefaults: MarkedOptions) {
  defaults = newDefaults;
}
