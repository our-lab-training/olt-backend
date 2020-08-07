<template>
  <span :class="caps ? 'text-capitalize' : ''">
    {{name}}
  </span>
</template>
<script>
import store from '@/store';

export default {
  props: {
    uglyName: {
      type: String,
      default: '',
    },
    caps: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: '',
    };
  },
  methods: {
    async prettyName(name) {
      if (!/^[0-9abcdef]{24}$/.test(name)) return name;
      const getKeys = Object.keys(store._actions).filter(k => /^(inductions|binders|quizzes|trainings)\/get$/.test(k));
      const tryGet = async (i) => {
        if (i >= getKeys.length) return null;
        try {
          // eslint-disable-next-line no-return-await
          return await store.dispatch(getKeys[i], name);
        } catch (err) {
          // eslint-disable-next-line no-return-await
          return await tryGet(i + 1);
        }
      };
      const item = await tryGet(0);
      return item ? item.text || item.title || item.name || name : name;
    },
  },
  async mounted() {
    this.name = this.uglyName;
    this.name = await this.prettyName(this.uglyName);
  },
  watch: {
    async uglyName(to, from) {
      if (to !== from) {
        this.name = this.uglyName;
        this.name = await this.prettyName(this.uglyName);
      }
    },
  },
};
</script>
