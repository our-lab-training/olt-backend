<template>
  <v-card v-if="writePerm || inducts.filter(i => !filter || i.filter === filter).length">
    <v-toolbar dense class="induction-list">
      <v-toolbar-title>{{label}}</v-toolbar-title>
      <v-spacer />
      <v-flex shrink>
        <v-text-field
          v-model="search"
          append-icon="far fa-search"
        />
      </v-flex>
      <v-tooltip top>
        <v-btn
          v-if="writePerm && inductId !== 'new'"
          slot="activator"
          to="./new"
          flat icon
        >
          <v-icon>far fa-plus</v-icon>
        </v-btn>
        <span>New Induction</span>
      </v-tooltip>
    </v-toolbar>
    <v-list three-line>
      <v-list-tile
        v-for="induct in inducts.filter(i => !filter || i.filter === filter)"
        :key="induct._id"
        :to="`./${induct._id}`"
      >
        <v-list-tile-content>
          <v-list-tile-title v-text="induct.name" />
          <v-list-tile-sub-title
            v-if="(new Date(induct.published)).getTime() < Date.now()"
            :class="induct.complete ? 'success--text' : 'error--text'"
          >
            <v-icon
              small left
              :color="induct.complete ? 'success' : 'error'"
            >
              fal fa-{{induct.complete ? 'check-square' : 'times-square'}}
            </v-icon>
            {{induct.complete ? 'Completed' : 'Incomplete'}}
          </v-list-tile-sub-title>
          <v-list-tile-sub-title v-else>
            <v-icon small left>fal fa-{{induct.published ? 'alarm-clock' : 'times'}}</v-icon>
            Unpublished <span v-if="!induct.published">
              (Created By {{(getUser(train.createdBy) || {}).name}})
            </span><span v-else>
              ({{induct.published | moment('fromNow')}})
            </span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-if="!inducts.length" :to="writePerm ? './new' : '#'">
        <v-list-tile-content>
          <v-list-tile-title v-text="'No Inductions Found!'" />
          <v-list-tile-sub-title v-if="writePerm" class="text--primary">
            <v-icon style="font-size: inherit;">far fa-plus</v-icon>
            Create new induction
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  props: {
    label: { type: String, default: 'Inductions' },
    filter: { type: String, default: undefined },
  },
  data() {
    return {
      search: '',
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', getUser: 'get' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { findInduct: 'find' }),
    inductId() { return this.$route.params.inductId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.inductions.write`); },
    inducts() {
      const query = {
        groupId: this.currentGroup._id,
      };
      if (!this.writePerm) query.published = v => (new Date(v)).getTime() < Date.now();
      if (this.search) {
        const reg = RegExp(`(${this.search.replace(/\s/g, ')|(')})`, 'i');
        query.name = v => reg.test(v);
      }
      return this.findInduct({ query }).data.map(induct => ({
        ...induct,
        complete: this.hasPerm(`inductions.${induct._id}.complete`, true),
        filter: this.hasPerm(`inductions.${induct._id}.inductor`, true) ? 'inductor' : 'inductee',
      }));
    },
  },
};
</script>

<style lang="stylus" scoped>
.induction-list >>> .v-select,
.induction-list >>> .v-text-field
  width min-content
  min-width 100px
</style>
