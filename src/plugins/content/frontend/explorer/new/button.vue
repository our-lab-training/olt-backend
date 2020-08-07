<template>
  <v-menu offset-y v-if="hasPerm(`${currentGroup._id}.content.write`)">
    <v-btn slot="activator" round color="primary" dark>
      <v-icon>add</v-icon> New File
    </v-btn>
    <new-list />
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex';
import newList from './list.vue';

export default {
  components: {
    newList,
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
  },
};
</script>
