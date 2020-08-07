<template>
  <component v-if="displayData.edit" :is="displayData.edit" :opts="displayData.opts || {}" />
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import supportedFiles from '../../supportedFiles';
import markdown from './edit/markdown.vue';
import textEdit from './edit/text.vue';
import linkEdit from './edit/link.vue';

let disData;

export default {
  components: {
    markdown,
    textEdit,
    linkEdit,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('content', { currentContent: 'current' }),
    ...mapState('content', ['isOperationPending']),
    displayData() {
      disData = this.isOperationPending
        ? disData
        : supportedFiles[this.currentContent.type];
      return disData;
    },
  },
  updated() {
    if (!supportedFiles[this.currentContent.type].edit) {
      this.$route.replace({ ...this.$route, query: {} });
    }
  },
  mounted() {
    if (!supportedFiles[this.currentContent.type].edit) {
      this.$route.replace({ ...this.$route, query: {} });
    }
  },
};
</script>
