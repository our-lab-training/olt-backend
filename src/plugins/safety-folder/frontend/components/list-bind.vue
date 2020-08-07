<template>
  <v-card>
    <v-toolbar dense class="binder-list">
      <v-flex shrink>
        <v-select
          :items="bindTypes"
          v-model="type"
        />
      </v-flex>
      <v-spacer />
      <v-flex shrink>
        <v-text-field
          v-model="search"
          append-icon="far fa-search"
        />
      </v-flex>
      <v-tooltip top>
        <v-btn
          v-if="writePerm && id !== 'new'"
          slot="activator"
          to="./new"
          flat icon
        >
          <v-icon>far fa-plus</v-icon>
        </v-btn>
        <span>New Document Set</span>
      </v-tooltip>
    </v-toolbar>
    <v-list three-line>
      <v-list-tile
        v-for="bind in binds"
        :key="bind._id"
        :to="`./${bind._id}`"
      >
        <v-list-tile-content>
          <v-list-tile-title v-text="bind.name" />
          <v-list-tile-sub-title>
            ({{bindTypes.find(t => t.value === bind.type).text}}) {{bind.desc}}
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-if="!binds.length" :to="writePerm ? './new' : '#'">
        <v-list-tile-content>
          <v-list-tile-title v-text="'No Doument Sets Found!'" />
          <v-list-tile-sub-title v-if="writePerm" class="text--primary">
            <v-icon style="font-size: inherit;">far fa-plus</v-icon>
            Create a new document set
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import types from '../../types';

export default {
  data() {
    return {
      search: '',
      bindTypes: [
        { text: 'All', value: '' },
        ...types.binds,
      ],
      type: '',
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { findBind: 'find' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binders.write`); },
    binds() {
      const query = { groupId: this.currentGroup._id };
      if (this.type) query.type = this.type;
      if (this.search) {
        const reg = RegExp(`(${this.search.replace(/\s/g, ')|(')})`, 'i');
        query.$or = [
          { name: v => reg.test(v) },
          { desc: v => reg.test(v) },
        ];
      }
      return this.findBind({ query }).data;
    },
  },
};
</script>

<style lang="stylus" scoped>
.binder-list >>> .v-select,
.binder-list >>> .v-text-field
  width min-content
  min-width 100px
</style>
