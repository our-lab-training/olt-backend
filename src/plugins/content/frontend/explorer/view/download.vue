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
    </v-toolbar>
    <v-card-text style="text-align: center;">
      We cannot currently display this file.
      <br>
      <v-btn color="success" @click="download">
        <v-icon v-if="!isOperationPending" left>fal fa-cloud-download</v-icon>
        <v-icon v-else left>fas fa-circle-notch fa-spin</v-icon>
        Download
      </v-btn>
    </v-card-text>
  </v-card>
</template>
<script>
import { mapGetters, mapState } from 'vuex';
import backBtn from '../back.vue';

export default {
  components: {
    backBtn,
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters('content', ['current']),
    ...mapState('content', ['isOperationPending']),
    ext() { return this.current.filename.split('.').pop(); },
  },
  methods: {
    async download() {
      if (this.current) this.$content.downloadFile(this.current);
    },
  },
};
</script>

