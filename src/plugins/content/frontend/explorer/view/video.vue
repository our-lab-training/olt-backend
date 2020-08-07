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
    <video v-if="url" controls>
      <source :src="url" :type="current.type">
      Your browser does not support this type of video :(
    </video>
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
    return {
      presign: null,
    };
  },
  computed: {
    ...mapGetters('content', ['current']),
    ...mapState('content', ['isOperationPending']),
    ext() { return this.current.filename.split('.').pop(); },
    path() { return this.$route.params.path; },
    url() {
      if (!this.presign) return '';
      return this.presign.url;
    },
  },
  mounted() {
    setTimeout(async () => {
      if (!this.current) return console.log('nope');
      const content = await this.$content._getPresign(this.current, 'read');
      this.presign = content.presign;
      return content;
    }, 200);
  },
  watch: {
    async path() {
      if (!this.current) return;
      const content = await this.$content._getPresign(this.current, 'read');
      this.presign = content.presign;
    },
  },
};
</script>

<style scoped>
video {
  width: 100%;
  max-height: 75vh;
}
</style>
