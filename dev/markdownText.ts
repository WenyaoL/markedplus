export const markdownText1 = `
Marked - Markdown Parser
========================

[Marked] lets you convert [Markdown] into HTML.  Markdown is a simple text format whose goal is to be very easy to read and write, even when not converted to HTML.  This demo page will let you type anything you like and see how it gets converted.  Live.  No more waiting around.

How To Use The Demo
-------------------

1. Type in stuff on the left.
2. See the live updates on the right.

That's it.  Pretty simple.  There's also a drop-down option above to switch between various views:

- **Preview:**  A live display of the generated HTML as it would render in a browser.
- **HTML Source:**  The generated HTML before your browser makes it pretty.
- **Lexer Data:**  What [marked] uses internally, in case you like gory stuff like this.
- **Quick Reference:**  A brief run-down of how to format things using markdown.

Why Markdown?
-------------

It's easy.  It's not overly bloated, unlike HTML.  Also, as the creator of [markdown] says,

> The overriding design goal for Markdown's
> formatting syntax is to make it as readable
> as possible. The idea is that a
> Markdown-formatted document should be
> publishable as-is, as plain text, without
> looking like it's been marked up with tags
> or formatting instructions.

Ready to start writing?  Either start changing stuff on the left or
[clear everything](/demo/?text=) with a simple click.

[Marked]: https://github.com/markedjs/marked/
[Markdown]: http://daringfireball.net/projects/markdown/

`

export const paragraphMarkdownText = `
### paragraph
This is a paragraph.

------
**bold font**
\`codeInline font\`
*em font*
~~deleteLine font~~
**bold + ~~deleteLine~~ font**
`


export const fenceMarkdownText = `
### codeBlock
\`\`\`java
@Configuration
public class TestConfig {
    //do
    @Bean(initMethod = "init",destroyMethod = "destory")
    public TestInitMethod testInitMethod(){
        return new TestInitMethod();
    }
}
\`\`\`
`

export const imgMarkdownText = `
### img
![marked](https://camo.githubusercontent.com/74b21684dcc0418e3ab7e6f09a8d5d22b75327ab49f88e4143b086d389be1a8c/68747470733a2f2f6d61726b65642e6a732e6f72672f696d672f6c6f676f2d626c61636b2e737667)asdfasdfasdfsadfasdf
`

export const tableMarkdownText = `
### table
| ADSF   | ASDF | ASDF |
| ------ | ---- | ---- |
| ASDF   | ASDF | ASDF |
| ASDF   | ASDF | SADF |
| SADFSD | F    | ASDF |
`

export const listMarkdownText = `
* **123456**

* abcdef
`

export const markdownText3 = 
markdownText1 + 
paragraphMarkdownText + 
fenceMarkdownText + 
imgMarkdownText + 
tableMarkdownText +
listMarkdownText