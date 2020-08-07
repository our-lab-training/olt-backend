<template>
  <component
    v-if="displayData.view"
    :is="displayData.view"
    :opts="displayData.opts || {}"
    :show-hidden="showHidden"
    @update:show-hidden="$emit('update:show-hidden', $event)"
  />
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import supportedFiles from '../../supportedFiles';
import directory from './view/directory.vue';
import textView from './view/text.vue';
import markdown from './view/markdown.vue';
import download from './view/download.vue';
import imageView from './view/image.vue';
import msdocView from './view/msdoc.vue';
import linkView from './view/link.vue';
import videoView from './view/video.vue';

let disData;

export default {
  components: {
    directory,
    textView,
    markdown,
    download,
    imageView,
    msdocView,
    linkView,
    videoView,
  },
  props: {
    showHidden: {
      type: Boolean,
      default: localStorage.showHiddenContent === 'true',
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('content', { currentContent: 'current' }),
    ...mapState('content', ['isOperationPending']),
    displayData() {
      if (!this.currentContent) return disData;
      disData = this.isOperationPending
        ? disData
        : supportedFiles[this.currentContent.type];
      return disData;
    },
  },
};
</script>
