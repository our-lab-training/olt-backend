<template>
  <v-tabs fixed-tabs v-model="tab">
    <v-tab :style="{minWidth: 'initial'}">
      <v-icon left>fal fa-upload</v-icon> Upload
    </v-tab>
    <v-tab :style="{minWidth: 'initial'}">
      <v-icon left>fal fa-folder-open</v-icon> Existing
    </v-tab>
    <v-tab :style="{minWidth: 'initial'}">
      <v-icon left>fal fa-external-link-square</v-icon> Link
    </v-tab>
    <v-tab-item>
      <v-divider/>
      <v-layout row wrap justify-center style="padding-top:1em;">
        <file-upload @input="filename = $event" @formData="file = $event[0]"/>
        <v-flex xs12>
          <v-text-field
            label="File Name"
            :value="filename.replace(suffix, '')"
            @input="filename = `${$event}${suffix}`"
            :suffix="suffix"
            :disabled="!file"
          />
        </v-flex>
      </v-layout>
    </v-tab-item>
    <v-tab-item>
      <tree input-mode :value="value" @input="active = $event" />
    </v-tab-item>
    <v-tab-item>
      <v-divider/>
      <v-text-field
        label="Link Name"
        :value="filename.replace('.uri', '')"
        @input="filename = `${$event}.uri`"
      />
      <v-text-field
        :label="`Link to File/Resource`"
        placeholder="https://www.example.com/important-doc-v3.pdf"
        v-model="link"
        type="url"
        required
      />
    </v-tab-item>
  </v-tabs>
</template>

<script>
import { mapGetters } from 'vuex';
import fileUpload from '@/views/partials/file-upload.vue';
import tree from './explorer/tree.vue';
import supportedFiles from '../supportedFiles';

const getType = (filename) => {
  const ext = filename.split('.').pop();
  if (!ext) return undefined;
  return Object.keys(supportedFiles).find(i => supportedFiles[i].ext.indexOf(ext) !== -1);
};

export default {
  props: {
    path: { type: String, default: '' },
    save: { type: Function, default: () => async () => {} },
    value: { type: String, default: '' },
    perms: { type: Array, default: () => undefined },
  },
  components: {
    tree,
    fileUpload,
  },
  data() {
    return {
      active: '',
      tab: this.value ? 1 : 0,
      filename: '',
      file: null,
      link: '',
    };
  },
  computed: {
    ...mapGetters('content', { getCont: 'get' }),
    existing() {
      const active = this.getCont(this.active);
      if (!active || active.type === 'text/x-directory') return '';
      return this.active;
    },
    suffix() {
      const parts = this.filename.split('.');
      if (parts.length < 2) return '';
      return `.${parts.pop()}`;
    },
    valid() {
      if (this.tab === 0) return !!(!!this.file && getType(this.filename));
      if (this.tab === 1) return !!this.existing;
      if (this.tab === 2) return !!this.filename && !!this.link;
      return false;
    },
  },
  methods: {
    async saveFile() {
      if (!this.valid) return '';
      if (this.tab === 1) return this.existing;
      if (this.tab === 2 && !/\.uri$/.test(this.filename)) this.filename += '.uri';
      const { content } = await this.$content.createFile(
        `${this.path}${this.filename}`,
        null,
        this.tab === 0 ? this.file : this.link,
        getType(this.filename),
        this.perms,
      );
      return content._id;
    },
  },
  mounted() {
    this.$emit('update:save', this.saveFile);
  },
  watch: {
    valid(v) {
      this.$emit('update:valid', v);
    },
  },
};
</script>

