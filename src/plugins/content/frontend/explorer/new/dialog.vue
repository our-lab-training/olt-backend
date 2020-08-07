<template>
  <v-dialog
      :value="dialog"
      @input="$emit('update:dialog', $event);"
      max-width="390"
    >
      <v-card>
        <v-card-title class="headline">Create a new {{fileRef}}.</v-card-title>
        <v-card-text>
          <span v-if="error" class="error--text">{{error}}<br><br></span>
          {{type === 'upload' ? 'Upload' : 'Create'}} a {{fileRef}} at
          <code>/{{currParent.path}}</code>
          <v-form ref="form" v-model="valid" lazy-validation @submit.prevent="create()">
            <span class="error--text" v-if="!fileValid">
              File given exceeds the upload limit of 100Mb
            </span>
            <file-upload
              v-if="type === 'upload'"
              v-model="uploadName"
              @formData="file = $event.length ? $event[0] : null"
              icon="fal fa-cloud-upload"
              label="choose file..."
              required
            />
            <v-text-field
              v-if="type !== 'upload' || file"
              :label="`Unique ${fileRef[0].toUpperCase()}${fileRef.slice(1)} Name`"
              :suffix="suffix"
              :hint="(!suffix && fileRef === 'file')
                ? 'You must add a file extension. e.g. `.txt`'
                : ''
              "
              v-model="filename"
              :rules="filenameRules"
              validate-on-blur
              required
            />
            <v-text-field
              v-if="type === 'link'"
              :label="`Link to File/Resource`"
              placeholder="https://www.example.com/important-doc-v3.pdf"
              v-model="link"
              type="url"
              validate-on-blur
              required
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn
            flat="flat"
            @click="$emit('update:dialog', false);"
          >
            Cancel
          </v-btn>

          <v-btn
            color="green darken-1"
            flat="flat"
            @click.stop="create()"
            :loading="isOperationPending"
            :disabled="!valid || !fileValid || isOperationPending"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { capitalize } from 'lodash';
import store from '@/store';
import fileUpload from '@/views/partials/file-upload.vue';
import supportedFiles from '../../../supportedFiles';

const getType = (filename) => {
  const ext = filename.split('.').pop();
  if (!ext) return undefined;
  return Object.keys(supportedFiles).find(i => supportedFiles[i].ext.indexOf(ext) !== -1);
};
let suffix;
let currentType;
let currentParent;

export default {
  components: {
    fileUpload,
  },
  props: {
    type: {
      type: String,
      default: 'text',
    },
    parent: {
      type: String,
      default: '',
    },
    dialog: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      valid: true,
      file: null,
      uploadName: '',
      filename: '',
      link: '',
      filenameRules: [
        v => /^[^\\/:*"<>|]+$/.test(v) || 'Invalid file name charaters.',
        (v) => {
          let filename = v;
          if (suffix && !RegExp(`${suffix.replace('.', '\\.')}$`).test(filename)) {
            filename += suffix;
          }
          if (currentType === 'file' && !getType(filename)) return 'Invalid file extension.';
          const name = filename;
          return !store.getters['content/find']({ query: { name } }).data.length || 'This file name is already taken.';
        },
      ],
      error: '',
    };
  },
  methods: {
    async create() {
      this.error = '';
      if (!this.$refs.form.validate()) return;
      let content = '';
      let { filename } = this;
      if (this.type === 'markdown') content += `# ${capitalize(this.filename.split('.').shift())}`;
      if (this.type === 'upload') content = this.file;
      if (this.type === 'link') {
        content = this.link;
        if (!/\.uri$/.test(filename)) filename += '.uri';
      }
      if (this.suffix && !RegExp(`${this.suffix.replace('.', '\\.')}$`).test(filename)) {
        filename += this.suffix;
      }
      const type = this.type === 'directory' ? 'text/x-directory' : getType(filename);
      const name = filename;
      const perms = (this.currParent.perms || []).filter(p => p !== 'superadmin.content.deleteroots');
      try {
        await this.$content.createFile(name, (this.currParent || {})._id, content, type, perms);
        this.$emit('update:dialog', false);
      } catch (err) {
        this.error = `An error occured creating the new ${this.fileRef}, please contact an administrator.`;
        return console.error([err]); // eslint-disable-line no-console, consistent-return
      }
    },
  },
  computed: {
    ...mapGetters('content', {
      currentContent: 'current',
      getContent: 'get',
      findContent: 'find',
    }),
    ...mapState('content', ['isOperationPending']),
    ...mapGetters('groups', { currentGroup: 'current' }),
    currParent() {
      currentParent = this.parent
        ? this.getContent(this.parent)
        : this.currentContent;
      return currentParent;
    },
    suffix() {
      suffix = '';
      if (this.type === 'markdown') suffix = '.md';
      if (this.type === 'upload' && this.uploadName) {
        suffix = `.${this.uploadName.split('.').pop()}`;
      }
      return suffix;
    },
    fileRef() {
      if (this.type === 'directory') return 'folder';
      if (this.type === 'link') return 'link';
      return 'file';
    },
    fileValid() {
      if (this.type !== 'upload' || !this.file) return true;
      return this.file.size <= 104857600;
    },
  },
  watch: {
    dialog() { this.$emit('update:dialog', this.dialog); },
    type() { currentType = this.type; },
    uploadName() {
      if (this.uploadName) this.filename = this.uploadName;
      else this.filename = '';
    },
  },
  mounted() {
    currentType = this.type;
  },
};
</script>

<style scoped>
</style>
