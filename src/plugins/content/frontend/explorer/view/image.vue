<template>
  <v-card>
    <v-toolbar dense>
      <back-btn />
      <v-toolbar-title>
        <span
          class="text-capitalize"
          ref="filename"
        >{{((current && current.filename) || '').replace(/\.[\w-]+$/, '')}}</span>.{{ext}}
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <v-card-text class="grey img-wrap">
      <img v-if="!isOperationPending" :src="src" :alt="(current || {}).filename"/>
      <v-icon v-else dark>fas fa-circle-notch fa-spin</v-icon>
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
    return {
      src: '',
      loaded: null,
    };
  },
  computed: {
    ...mapGetters('content', ['current']),
    ...mapState('content', ['isOperationPending']),
    ext() { return this.current && this.current.filename.split('.').pop(); },
  },
  mounted() { this.payload(); },
  updated() { this.payload(); },
  methods: {
    async payload() {
      if (!this.current) return '';
      if (this.loaded === this.current._id || this.current.type === 'text/x-directory') {
        return this.src;
      }
      this.loaded = this.current._id;
      const file = await this.$content.readFile(this.current);
      const reader = new FileReader();
      reader.onload = () => {
        this.src = reader.result;
      };
      return reader.readAsDataURL(file);
    },
  },
};
</script>

<style lang="stylus" scoped>
.img-wrap
  text-align center
img
  max-width 100%
</style>

