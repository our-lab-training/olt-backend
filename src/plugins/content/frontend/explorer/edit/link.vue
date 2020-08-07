<template>
  <v-card @keyup.ctrl.83.stop="save">
    <v-toolbar dense>
      <back-btn />
      <v-toolbar-title>
        <span
          class="text-capitalize"
          ref="filename"
          contenteditable
        >{{current.filename.replace(/\.[\w-]+$/, '')}}</span>
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
      <v-text-field
        :loading="loading"
        :label="`Link to File/Resource`"
        placeholder="https://www.example.com/important-doc-v3.pdf"
        v-model="text"
        type="url"
        required
      />
    </v-card-text>
  </v-card>
</template>
<script>
/* eslint-disable import/no-extraneous-dependencies */
import { mapGetters, mapState } from 'vuex';
import supportedFiles from '../../../supportedFiles';
import backBtn from '../back.vue';

export default {
  components: {
    backBtn,
  },
  data() {
    return {
      text: '',
      savedText: '',
      supportedFiles,
      loaded: null,
      loading: false,
    };
  },
  computed: {
    ...mapGetters('content', ['current']),
    ...mapState('content', ['isOperationPending']),
    filename() { return this.$refs.filename.innerHTML.trim(); },
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
      this.loading = true;
      const file = await this.$content.readFile(this.current);
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.loading = false;
        this.text = evt.target.result;
        this.savedText = this.text;
      };
      return reader.readAsText(file);
    },
    async save() {
      if (!this.current || this.text === this.savedText) return;
      this.loading = true;
      if (this.filename !== this.current.filename.replace(/\.[\w-]+$/, '')) {
        const newName = `${this.filename}.uri`;
        await this.$content.renameFile(this.current, newName);
      }
      await this.$content.writeFile(this.current, this.text);
      this.savedText = this.text;
      this.loading = false;
    },
  },
};
</script>
