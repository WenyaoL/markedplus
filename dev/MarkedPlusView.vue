<script setup lang='ts'>
import { ref, onMounted } from 'vue'
import { Marked } from '../src/marked'
import { markdownText1, fenceMarkdownText } from './markdownText'
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'
import { MarkedExtension } from '../src/type';

const markedPlusRef = ref<HTMLElement>()

const marked = new Marked({})

const mh = markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
})
console.log(marked.defaults);
marked.use(mh as MarkedExtension)
console.log(marked.defaults);
onMounted(() => {
    const htmlString = marked.parse(markdownText1 + "\n" + fenceMarkdownText)
    const element = markedPlusRef.value as HTMLElement
    element.innerHTML = htmlString
})


</script>

<template>
    <div ref="markedPlusRef">

    </div>
</template>

<style scoped></style>