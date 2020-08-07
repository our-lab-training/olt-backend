<template>
  <v-card>
    <v-toolbar dense class="binder-list">
      <!-- <v-flex shrink>
        <v-select
          :items="bindTypes"
          v-model="type"
        />
      </v-flex> -->
      <v-toolbar-title>My Training</v-toolbar-title>
      <v-spacer />
      <v-flex shrink>
        <v-text-field
          v-model="search"
          append-icon="far fa-search"
        />
      </v-flex>
      <v-tooltip top>
        <v-btn
          v-if="writePerm && bindId !== 'new'"
          slot="activator"
          to="./new"
          flat icon
        >
          <v-icon>far fa-plus</v-icon>
        </v-btn>
        <span>New Training</span>
      </v-tooltip>
    </v-toolbar>
    <v-list three-line>
      <v-list-tile
        v-for="train in trains"
        :key="train._id"
        :to="`./${train.bindId}`"
      >
        <v-list-tile-content>
          <v-list-tile-title v-text="train.name" />
          <v-list-tile-sub-title
            v-if="(new Date(train.published)).getTime() < Date.now()"
            :class="train.complete ? 'success--text' : 'error--text'"
          >
            <v-icon
              small left
              :color="train.complete ? 'success' : 'error'"
            >
              fal fa-{{train.complete ? 'check-square' : 'times-square'}}
            </v-icon>
            {{train.complete ? 'Completed' : 'Incomplete'}}
          </v-list-tile-sub-title>
          <v-list-tile-sub-title v-else>
            <v-icon small left>fal fa-{{train.published ? 'alarm-clock' : 'times'}}</v-icon>
            Unpublished <span v-if="!train.published">
              (Created By {{(getUser(train.createdBy) || {}).name}})
            </span><span v-else>
              ({{train.published | moment('fromNow')}})
            </span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>

      <v-list-tile v-if="!trains.length" :to="writePerm ? './new' : '#'">
        <v-list-tile-content>
          <v-list-tile-title v-text="'No Training Found!'" />
          <v-list-tile-sub-title v-if="writePerm" class="text--primary">
            <v-icon style="font-size: inherit;">far fa-plus</v-icon>
            Create new training
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import types from '../../../types';

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
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', getUser: 'get' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('trainings', { findTrain: 'find' }),
    bindId() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.trainings.write`); },
    trains() {
      const query = {
        groupId: this.currentGroup._id,
      };
      if (!this.writePerm) query.published = v => (new Date(v)).getTime() < Date.now();
      if (this.search) {
        const reg = RegExp(`(${this.search.replace(/\s/g, ')|(')})`, 'i');
        query.name = v => reg.test(v);
      }
      return this.findTrain({ query }).data;
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
