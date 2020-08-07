<template>
  <v-card>
    <v-toolbar dense>
      <back-btn />
      <v-toolbar-title>
        <span
          class="text-capitalize"
          ref="filename"
        >{{current.filename.replace(/\.[\w-]+$/, '')}}</span>
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
      <p>
        This link will take you to an external website, make sure you trust the source.<br>
        <span class="error--text">{{err}}</span>
      </p>
      <p>
        <v-btn color="primary" :href="text" target="_blank" :loading="!text" :disabled="!!err">
          <v-icon left>fal fa-external-link-square</v-icon>
          Open the link
        </v-btn>
      </p>
      <p>
        <a @click="showLink = !showLink">
          <v-icon left small color="#1976d2">fal fa-caret-{{showLink ? 'down' : 'up'}}</v-icon>
          Show the link
        </a>
      </p>
      <p v-if="showLink"><code>{{text}}</code></p>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapGetters } from 'vuex';
import backBtn from '../back.vue';

export default {
  components: {
    backBtn,
  },
  props: ['opts'],
  data() {
    return {
      text: '',
      loaded: null,
      loading: false,
      showLink: false,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('content', ['current']),
    ext() { return this.current.filename.split('.').pop(); },
    err() { return this.text.indexOf('An issue') === 0 ? this.text : ''; },
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
        this.text = evt.target.result;
      };
      return reader.readAsText(file);
    },
  },
};
</script>
