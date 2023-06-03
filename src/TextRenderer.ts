/**
 * TextRenderer
 * returns only the textual part of the token
 */
export class TextRenderer{
  [x: string]: (...text: any) => string;
  // no need for block level renderers
  strong(text:string) {
    return text;
  }

  em(text:string) {
    return text;
  }

  codespan(text:string) {
    return text;
  }

  del(text:string) {
    return text;
  }

  html(text:string) {
    return text;
  }

  text(text:string) {
    return text;
  }

  link(href:string, title:string, text:string) {
    return '' + text;
  }

  image(href:string, title:string, text:string) {
    return '' + text;
  }

  br() {
    return '';
  }
}
