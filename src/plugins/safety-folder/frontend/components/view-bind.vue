<template>
  <v-card>
    <ve-toolbar
      :binder="binder"
    />
    <v-card-text v-if="binder.desc">
      {{binder.desc}}
    </v-card-text>
    <v-card-text>
      <v-layout row wrap>
          <v-flex shrink>
            <h2>Documents</h2>
          </v-flex>
          <v-spacer/>
          <v-flex xs12><v-list>
            <v-list-group
              v-for="cat in Object.keys(items)"
              :key="cat"
              :value="true"
              no-action
            >
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ (type.cats.find(c => c.value === cat) || {}).text }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile
                v-for="(item, i) in items[cat].filter(item => !!item.data.enabled)"
                :key="i"
                :to="`../${item.type}/${item.itemId}`"
              >
                <v-list-tile-content>
                  <v-list-tile-title>
                    <v-icon small left v-if="item.type === 'content'">
                      fal fa-{{item.data.type === 'text/uri-list' ? 'link' : 'file'}}
                    </v-icon>
                    {{
                      item.type !== 'content'
                      ? item.data.name
                      : supportedFiles[item.data.type].hideExt
                        ? item.data.filename.replace(/\.[\w-]+$/, '')
                        : item.data.filename
                    }}
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list-group>
          </v-list></v-flex>
        </v-layout>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import veToolbar from './view-edit-toolbar.vue';
import types from '../../types';
import supportedFiles from '../../../content/supportedFiles';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      binder: { items: [] },
      types,
      supportedFiles,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binder.write`); },
    type() { return this.types.binds.find(t => t.value === this.binder.type); },
    items() {
      const items = groupBy(cloneDeep(this.binder.items), 'category');
      Object.values(items).forEach(catItems => catItems.forEach((item) => {
        item.data = this.$store.getters[`${item.type}/get`](item.itemId) || {};
      }));
      return items;
    },
  },
  methods: {
    setBind() {
      const bind = this.getBind(this.id);
      if (!bind) return this.$router.push('./');
      this.binder = bind;
      return this.binder;
    },
  },
  mounted() {
    this.setBind();
  },
  watch: {
    id() {
      this.setBind();
    },
  },
};
</script>
