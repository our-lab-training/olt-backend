<template>
    <markdown :opts="opts"/>
</template>
<script>
import markdown from './markdown.vue';

export default {
  components: {
    markdown,
  },
  props: ['opts'],
};
</script>

<style>
.tui-editor-contents code {
  background-color: transparent;
  -webkit-box-shadow: none;
  box-shadow: none;
}
</style>

