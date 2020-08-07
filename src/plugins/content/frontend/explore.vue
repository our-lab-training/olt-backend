<template>
  <v-container fluid grid-list-md style="padding:0;"><v-layout>
    <v-flex class="md4 lg3" v-if="$vuetify.breakpoint.mdAndUp">
      <v-card>
        <v-toolbar dense>
          <v-toolbar-title>
            Content
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <p>
            This is a place where documents are stored for the organisation.
            You can click on a file to to open a view it.
          </p>
        </v-card-text>
      </v-card>
      &nbsp;
      <tree
        :show-hidden="showHidden && hasPerm(`${currentGroup._id}.content.read-hidden`)"
        @update:show-hidden="showHidden = $event"
      />
    </v-flex>
    <v-flex class="xs12 md8 lg9">
      <viewFile
        v-if="typeof $route.query.edit === 'undefined'"
        :show-hidden="showHidden && hasPerm(`${currentGroup._id}.content.read-hidden`)"
        @update:show-hidden="showHidden = $event"
      />
      <editFile v-else />
    </v-flex>
  </v-layout></v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import store from '@/store';
import router from '@/router';
import tree from './explorer/tree.vue';
import viewFile from './explorer/view.vue';
import editFile from './explorer/edit.vue';

/* const isDirectory = (path, parent = '', groupId) => {
  const name = `${groupId}${parent
    ? `/${parent}`
    : ''
  }${path ? `/${path.replace(/\/$/, '')}` : ''}/.directory`;
  const contents = store.getters['content/find']({ query: { name } }).data;
  return contents.length ? contents[0]._id : null;
};
const isFile = (path, parent = '', groupId) => {
  const name = `${groupId}${parent
    ? `/${parent}`
    : ''
  }${path ? `/${path.replace(/\/$/, '')}` : ''}`;
  const contents = store.getters['content/find']({ query: { name } }).data;
  return contents.length ? contents[0]._id : null;
}; */

const loadPath = async (to, from, next) => {
  const group = store.getters['groups/current'];
  // console.log(to, store.getters['content/find']());
  const { path } = to.params;
  // const { parent } = to.meta;
  const gPath = (to.meta.path || '').replace('{groupId}', group.slugs ? group.slugs[0] : group._id);
  router.contPush = p => router.push(gPath.replace(':path*', p));
  let pathId = null;
  if (!path) {
    const contents = await store._actions['content/find'][0]({
      query: {
        name: '.directory',
        groupId: group._id,
        parent: { $exists: false },
      },
    });
    if (contents.length) pathId = contents[0]._id;
  } else pathId = await store._actions['content/get'][0](path);
  if (!pathId) return next(gPath.replace(':path*', '') || '/');
  store.commit('content/setCurrent', pathId);
  return next();
};

export default {
  components: {
    tree,
    viewFile,
    editFile,
  },
  data() {
    return {
      showHidden: `${localStorage.showHiddenContent}` === 'true',
    };
  },
  computed: {
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('content', { currentContent: 'current' }),
    ...mapGetters('users', { hasPerm: 'hasPerm' }),
  },
  beforeRouteEnter: async (to, from, next) => {
    loadPath(to, from, next);
  },
  beforeRouteUpdate: async (to, from, next) => {
    loadPath(to, from, next);
  },
  beforeRouteLeave: (to, from, next) => { store.commit('content/clearCurrent'); next(); },
  watch: {
    showHidden(v) { localStorage.showHiddenContent = v; },
  },
};
</script>
