<template>
  <v-card @keyup.ctrl.83.stop="save">
    <v-toolbar dense>
      <back-btn/>
      <v-toolbar-title>
        <span
          class="text-capitalize"
          ref="filename"
          contenteditable
        >{{current.filename.replace(/\.[\w-]+$/, '')}}</span>.{{ext}}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        @click.stop="save"
        flat
        icon
        :loading="isOperationPending"
        :disabled="isOperationPending || text === savedText"
        v-shortkey="['ctrl', 's']" @shortkey="save()"
      >
        <v-icon>fal fa-save</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
        <editor
          v-model="text"
          :options="opts"
          previewStyle="vertical"
          height="100%"
        />
      </v-card-text>
  </v-card>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import 'tui-editor/dist/tui-editor.css';
// import 'tui-chart/dist/tui-chart.min.css';
import 'tui-color-picker/dist/tui-color-picker.min.css';
// import 'tui-editor/dist/tui-editor-contents.css';
import 'codemirror/lib/codemirror.css';
import { Editor } from '@toast-ui/vue-editor';
import 'tui-color-picker';
// import 'raphael';
// import 'tui-chart';
import 'tui-editor/dist/tui-editor-extScrollSync';
import 'tui-editor/dist/tui-editor-extTable';
import 'tui-editor/dist/tui-editor-extUML';
import 'tui-editor/dist/tui-editor-extColorSyntax';
// import 'tui-editor/dist/tui-editor-extChart';
import { mapGetters, mapState } from 'vuex';
import store from '@/store';
import supportedFiles from '../../../supportedFiles';
import backBtn from '../back.vue';

/* const chart = {
  name: 'chart',
  minWidth: 100,
  maxWidth: 600,
  minHeight: 100,
  maxHeight: 300,
}; */

export default {
  components: {
    editor: Editor,
    backBtn,
  },
  data() {
    return {
      text: '',
      savedText: '',
      type: store.getters['content/current'].type,
      supportedFiles,
      loaded: null,
      opts: {
        usageStatistics: false,
        previewStyle: 'vertical',
        exts: ['scrollSync', 'colorSyntax', 'uml', /* chart, */ 'table'],
      },
    };
  },
  computed: {
    ...mapGetters('content', ['current']),
    ...mapState('content', ['isOperationPending']),
    fileTypes() {
      return Object.keys(supportedFiles)
        .filter(i => supportedFiles[i].edit === 'textEdit')
        .map(i => ({ text: supportedFiles[i].name, value: i }));
    },
    filename() { return this.$refs.filename.innerHTML.trim(); },
    ext() {
      return this.current.type === this.type
        ? this.current.filename.split('.').pop()
        : supportedFiles[this.type].ext[0];
    },
  },
  mounted() { this.payload(); },
  updated() { this.payload(); },
  methods: {
    async payload() {
      if (!this.current) return '';
      if (this.loaded === this.current._id || this.current.type === 'text/x-directory') {
        return this.text;
      }
      this.loaded = this.current._id;
      const file = await this.$content.readFile(this.current);
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (this.opts && this.opts.lang) {
          this.text = `\`\`\`${this.opts.lang}\n${evt.target.result}\n\`\`\``;
        } else this.text = evt.target.result;
      };
      return reader.readAsText(file);
    },
    async save() {
      if (!this.current || this.text === this.savedText) return;
      if (this.filename === this.current.filename.replace(/\.[\w-]+$/, '')) {
        const newName = `${this.filename}.${this.ext}`;
        await this.$content.renameFile(this.current, newName);
      }
      await this.$content.writeFile(this.current, this.text);
      this.savedText = this.text;
    },
  },
};
</script>

<style scoped>
.v-card__text {
  padding: 0!important;
  height: calc(100vh - 108px - 34px);
}
</style>
