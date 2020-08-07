<template>
  <v-card>
    <v-toolbar dense>
      <back-btn v-if="back"/>
      <v-toolbar-title v-if="title">{{title}}</v-toolbar-title>
      <v-toolbar-title v-else>
        <span
          class="text-capitalize"
          ref="filename"
        >{{current.filename.replace(/\.[\w-]+$/, '')}}</span>.{{ext}}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="!hidden" flat icon @click="refresh()" :loading="refreshing">
        <v-icon>fal fa-sync</v-icon>
      </v-btn>
      <v-flex shrink>
        <v-select
          v-if="ext !== 'pdf'"
          :items="['MS Office', 'Google Docs']"
          v-model="render"
          label="Renderer"
        />
      </v-flex>
      <v-btn flat icon v-if="toggleHidden" @click="$emit('update:hidden', !hidden)">
        <v-icon>far fa-{{hidden ? 'chevron-up' : 'chevron-down'}}</v-icon>
      </v-btn>
    </v-toolbar>
    <iframe
      v-if="url"
      :style="!toggleHidden || !hidden ? {} : { height: '0' }"
      :src="url"
      frameborder='0'
    >
      This is an embedded
      <a target='_blank' href='http://office.com'> Microsoft Office </a>
      document, powered by
      <a target='_blank' href='http://office.com/webapps'> Office Online </a>
      .
    </iframe>
  </v-card>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import backBtn from '../back.vue';

export default {
  components: {
    backBtn,
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    fileId: {
      type: String,
      default: '',
    },
    back: {
      type: Boolean,
      default: true,
    },
    hidden: {
      type: Boolean,
      default: false,
    },
    toggleHidden: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      presign: null,
      render: 'MS Office',
      refreshing: false,
    };
  },
  computed: {
    ...mapGetters('content', { currentContent: 'current', getContent: 'get' }),
    ...mapState('content', ['isOperationPending']),
    ext() { return this.current.filename.split('.').pop(); },
    path() { return this.$route.params.path; },
    url() {
      if (!this.presign || this.refreshing) return '';
      if (this.ext === 'pdf') return this.presign.url;
      return this.render === 'Google Docs'
        ? `https://docs.google.com/gview?url=${this.presign.url.replace(/[&]/g, '%26')}&embedded=true`
        : `https://view.officeapps.live.com/op/embed.aspx?src=${this.presign.url.replace(/[&]/g, '%26')}`;
    },
    current() { return this.fileId ? this.getContent(this.fileId) : this.currentContent; },
  },
  methods: {
    async getPresign() {
      if (!this.current) return console.log('nope');
      const content = await this.$content._getPresign(this.current, 'read');
      this.presign = content.presign;
      return content;
    },
    getPresignStandoff() {
      setTimeout(async () => {
        if (!(await this.getPresign())) {
          setTimeout(async () => {
            if (!(await this.getPresign())) setTimeout(async () => this.getPresign(), 300);
          }, 200);
        }
      }, 100);
    },
    refresh() {
      this.refreshing = true;
      setTimeout(() => {this.refreshing = false;}, 500);
    },
  },
  mounted() {
    this.getPresignStandoff();
  },
  watch: {
    path() {
      this.getPresignStandoff();
    },
  },
};
</script>

<style scoped>
iframe {
  width: 100%;
  height: 75vh;
}
</style>

