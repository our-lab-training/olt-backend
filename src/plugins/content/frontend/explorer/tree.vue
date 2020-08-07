<template>
  <v-card
    v-shortkey.once.push="['ctrl']"
    @shortkey="selectMultiple = !selectMultiple"
    style="overflow-x: auto;"
  >
    <v-toolbar dense>
      <v-toolbar-title class="text-capitalize">
        {{inputMode ? 'Select A File' : ''}}
      </v-toolbar-title>
      <v-spacer />
      <v-flex shrink>
        <v-text-field
          class="content-search"
          v-model="search"
          prepend-icon="far fa-search"
          clearable
        />
      </v-flex>
    </v-toolbar>
    <v-card-text>
      <v-treeview
        v-model="tree"
        :open.sync="open"
        :items="items"
        :active.sync="active"
        activatable
        hoverable
        :multiple-active="selectMultiple"
        item-key="key"
      >
        <template slot="prepend" slot-scope="{ item, open, leaf, active }">
          <v-icon
            v-if="item.type === 'text/x-directory'"
            class="folder-icon"
          >
            fal {{ open || active ? 'fa-folder-open' : 'fa-folder' }}
          </v-icon>
          <file-icon v-else :content="{ type: item.type }" custStyle="font-size: 1.6em;"/>
        </template>
        <template slot="label" slot-scope="{ item, open, leaf, active }">
          <pretty-name :ugly-name="item.name"/>
        </template>
      </v-treeview>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex';
import supportedFiles from '../../supportedFiles';
import fileIcon from './fileIcon.vue';
import prettyName from './prettyName.vue';

export default {
  props: {
    multiple: {
      type: Boolean,
      default: false,
    },
    inputMode: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: () => undefined,
    },
    showHidden: {
      type: Boolean,
      default: localStorage.showHiddenContent === 'true',
    },
  },
  components: {
    fileIcon,
    prettyName,
  },
  data() {
    return {
      selectMultiple: this.multiple,
      open: [''],
      tree: [],
      active: [],
      supportedFiles,
      search: '',
    };
  },
  computed: {
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('content', { getCurrentContent: 'current', findCont: 'find', getCont: 'get' }),
    root() {
      return this.findCont({
        query: {
          name: '.directory',
          groupId: this.currentGroup._id,
          parent: { $exists: false },
        },
      }).data[0];
    },
    currentContent() {
      return (this.inputMode
        ? this.getCont(this.value)
        : this.getCurrentContent
      ) || this.root;
    },
    items() {
      const searchResults = [];
      if (!this.root) return [{ name: 'Corrupt content configuration!' }];
      const getPath = (parent) => {
        let res = this.findCont({ query: { parent } }).data;
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        res = this.$content._sort(res);
        return res.reduce((a, cont) => {
          if (cont._id === parent) return a;
          const child = {
            name: supportedFiles[cont.type].hideExt
              ? cont.filename.replace(/\.[\w-]+$/, '')
              : cont.filename,
            type: cont.type,
          };
          if (/^\./.test(child.name) && !this.showHidden) return a;
          child.key = cont._id;
          if (cont.type === 'text/x-directory') {
            child.children = getPath(cont._id);
          }
          searchResults.push(child);
          return [...a, child];
        }, []);
      };
      if (this.search.trim()) {
        const reg = RegExp(`(${this.search.trim().replace(/\s/g, ')|(')})`, 'i');
        getPath(this.root._id);
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.$content._sort(searchResults.filter(child => reg.test(child.name)));
      }
      return [
        {
          name: '/',
          key: '',
          type: 'text/x-directory',
          children: getPath(this.root._id),
        },
      ];
    },
  },
  watch: {
    active() {
      if (
        this.selectMultiple
        || this.active.length !== 1
        || this.active[0] === this.currentContent._id
      ) return;
      if (this.inputMode) this.$emit('input', this.active[0]);
      else this.$router.contPush(this.active[0]);
      if (this.open.indexOf(this.active[0]) === -1) this.open.push(this.active[0]);
    },
    multiple(v) { this.selectMultiple = v; },
  },
  mounted() {
    if (!this.currentContent) return;
    let curr = this.currentContent;
    const open = ['', curr._id];
    while (curr && curr.parent) {
      open.push(curr.parent);
      curr = this.getCont(curr.parent);
    }
    this.open = open;
    // if (this.currentContent.type === 'text/x-directory') return;
    this.active = [this.currentContent._id];
  },
};
</script>

<style>
.v-treeview-node:not(.v-treeview-node--leaf) > div > div > .folder-icon {
  margin-left: 9px;
}

.v-treeview-node__content {
  cursor: pointer;
}

.content-search {
  width: min-content;
  min-width: 150px;
}
</style>

