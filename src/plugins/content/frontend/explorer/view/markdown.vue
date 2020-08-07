<template>
  <v-card>
    <v-toolbar dense>
      <back-btn />
      <v-toolbar-title>
        <span
          class="text-capitalize"
          ref="filename"
        >{{current.filename.replace(/\.[\w-]+$/, '')}}</span>.{{ext}}
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        v-if="hasPerm(`${currentGroup._id}.content.write`)"
        @click.stop="loading = true;"
        flat
        icon
        :loading="loading"
        :disabled="loading"
        to="?edit"
      >
        <v-icon>fal fa-edit</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>
      <viewer v-model="text" :options="options"/>
    </v-card-text>
  </v-card>
</template>
<script>
/* eslint-disable no-extraneous-dependencies */
// import 'tui-editor/dist/tui-editor-contents.css';
import 'tui-editor/dist/tui-editor.css';
// import 'tui-chart/dist/tui-chart.min.css';
import 'tui-color-picker/dist/tui-color-picker.min.css';
import { Viewer } from '@toast-ui/vue-editor';
import 'tui-color-picker';
// import 'raphael';
// import 'tui-chart';
import 'tui-editor/dist/tui-editor-extScrollSync';
import 'tui-editor/dist/tui-editor-extTable';
import 'tui-editor/dist/tui-editor-extUML';
import 'tui-editor/dist/tui-editor-extColorSyntax';
// import 'tui-editor/dist/tui-editor-extChart';
import { mapGetters } from 'vuex';
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
    viewer: Viewer,
    backBtn,
  },
  props: ['opts'],
  data() {
    return {
      text: '',
      loaded: null,
      loading: false,
      options: {
        usageStatistics: false,
        exts: ['scrollSync', 'colorSyntax', 'uml', /* chart, */ 'table'],
      },
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('content', ['current']),
    ext() { return this.current.filename.split('.').pop(); },
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
  },
};
</script>

<style lang="stylus">
.tui-editor-defaultUI
  font-family Roboto,sans-serif
.tui-editor-contents
  h1, h2, h3, h4, h5, h6, li
    margin-bottom 0.5em
  table
    margin: 2px 0 14px;
    color: #555;
    width: auto;
    border-collapse: collapse;
    box-sizing: border-box;
  th, td
    height: 32px;
    padding: 5px 14px 5px 12px;
  td
    border: 1px solid #eaeaea;
  th
    border: 1px solid #72777b;
    border-top: 0;
    background-color: #7b8184;
    font-weight: 300;
    color: #fff;
    padding-top: 6px;
  .task-list-item
    border: 0;
    list-style: none;
    padding-left: 22px;
    margin-left: -22px;
    position relative
  .task-list-item::after
    font-family: "Font Awesome 5 Pro";
    font-weight: 400;
    position absolute
    content "\f0c8"
    left 0
    top 0
  .task-list-item.checked::after
    font-weight 900
    content "\f14a"
  .task-list-item input[type='checkbox'],
  .task-list-item .task-list-item-checkbox
    margin-left: -17px;
    margin-right: 3.8px;
    margin-top: 3px;
  code
    width: 100%;
  code::after,
  code::before,
  kbd::after,
  kbd::before
    width: 100%;
    display: inline-block;
</style>
