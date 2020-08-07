<template>
  <div>
    <v-card>
      <v-toolbar dense>
        <back-btn />
        <v-breadcrumbs :items="crumbs" v-if="$vuetify.breakpoint.mdAndUp">
          <v-icon slot="divider">fal fa-angle-right</v-icon>
          <template slot="item" slot-scope="props">
            <a
              :to="props.item.to"
              @click="$router.contPush(props.item.to)"
              v-if="props.item.to != $route.params.path"
            >
              <pretty-name :ugly-name="props.item.text" caps/>
            </a>
            <span v-else>
              <pretty-name :ugly-name="props.item.text" caps/>
            </span>
          </template>
        </v-breadcrumbs>
        <v-select
          v-else
          :items="crumbs"
          :value="$route.params.path"
          @input="$router.contPush($event)"
          item-value="to"
        ></v-select>
        <v-spacer/>
        <v-tooltip top v-if="hasPerm(`${currentGroup._id}.content.read-hidden`)">
          <v-btn
            flat icon
            @click.stop="$emit('update:show-hidden', !showHidden)"
            slot="activator"
          >
            <v-icon>fal fa-eye{{showHidden ? '' : '-slash'}}</v-icon>
          </v-btn>
          <span>{{showHidden ? 'Hide' : 'Show'}} Hidden Files and Folders</span>
        </v-tooltip>
        <new-button />
      </v-toolbar>
      <v-card-text :style="`background-color: ${$vuetify.dark ? '#212121' : '#eee'}`">
        <v-container fluid grid-list-md v-if="subdirs.length"><v-layout
          align-start
          justify-start
          row wrap
        >
          <v-flex
            xs6 sm4 lg3 xl2
            v-for="(subdir) in subdirs.filter(d => !/^\./.test(d.name) || showHidden)"
            :key="subdir._id"
          >
            <v-badge
              color="transparent" overlap
              :value="/^\./.test(subdir.filename)"
              style="width: 100%"
            >
              <v-icon slot="badge" small>fal fa-eye-slash</v-icon>
              <v-card
                hover
                :to="subdir._id"
                @click.prevent="$router.contPush(subdir._id)"
                @contextmenu="showMenu($event, subdir)"
                ref="subDir"
              >
                <v-card-text
                  class="body-2 text-xs-center"
                  :style="{'min-height': maxHeightDir, padding: '8px', width: '100%'}"
                >
                  <file-icon
                    :content="subdir" size="3"
                    :custStyle="{'margin-right': '0!important'}"
                  />
                  <br>
                  <pretty-name :ugly-name="subdir.filename"/>
                </v-card-text>
              </v-card>
            </v-badge>
          </v-flex>
        </v-layout></v-container>
        <v-divider v-if="subdirs.length && subfiles.length"/>
        <v-container fluid grid-list-md v-if="subfiles.length" fill-height><v-layout
          align-start
          justify-start
          row wrap
          class="full-height-cust"
        >
          <v-flex
            xs6 sm4 lg3 xl2
            v-for="(subfile) in subfiles.filter(f => !/^\./.test(f.filename) || showHidden)"
            :key="subfile.key"
          >
            <v-badge
              color="transparent" overlap
              :value="/^\./.test(subfile.filename)"
              style="width: 100%"
            >
              <v-icon slot="badge" small>fal fa-eye-slash</v-icon>
              <v-card
                hover
                :to="subfile._id"
                @click.prevent="
                  $router.contPush(subfile._id)
                "
                @contextmenu="showMenu($event, subfile)"
                ref="subFile"
              >
                <v-card-text
                  class="body-2 text-xs-center"
                  :style="{'min-height': maxHeightFile, padding: '8px'}"
                >
                  <file-icon
                    :content="subfile" size="3"
                    :custStyle="{'margin-right': '0!important'}"
                  />
                  <br>
                  <span>
                    {{
                      supportedFiles[subfile.type].hideExt
                      ? subfile.filename.replace(/\.[\w-]+$/, '')
                      : subfile.filename
                    }}
                  </span>
                </v-card-text>
              </v-card>
            </v-badge>
          </v-flex>
        </v-layout></v-container>
        <v-container fluid grid-list-md v-if="!subdirs.length && !subfiles.length"><v-layout
          align-center
          justify-center
          row wrap
        >
          <v-flex shrink>
            No files or folders found <new-button/>
          </v-flex>
        </v-layout></v-container>
      </v-card-text>
    </v-card>

    <v-menu
      v-model="menu.show"
      transition="slide-y-transition"
      :position-x="menu.x"
      :position-y="menu.y"
      absolute
      offset-y
    >
      <v-list>
        <v-list-tile
          :to="`${menu.context._id}?edit`"
          v-if="
            hasPerm(`${currentGroup._id}.content.write`)
            && menu.context
            && supportedFiles[menu.context.type]
            && supportedFiles[menu.context.type].edit
          "
        >
          <v-list-tile-action><v-icon>far fa-pencil</v-icon></v-list-tile-action>
          <v-list-tile-title>Edit</v-list-tile-title>
        </v-list-tile>
        <v-list-tile
          v-if="
            hasPerm(`${currentGroup._id}.content.write`)
            && menu.context
            && !/^[0-9abcdef]{24}$/.test(menu.context.name)
          "
          @click="renameMenu = menu.context; menu.show=false;"
        >
          <v-list-tile-action><v-icon>far fa-i-cursor</v-icon></v-list-tile-action>
          <v-list-tile-title>Rename</v-list-tile-title>
        </v-list-tile>
        <v-list-tile
          class="error--text"
          @click.stop="$content.deleteFile(menu.context); menu.show=false;"
          v-if="hasPerm(`${currentGroup._id}.content.write`)"
        >
          <v-list-tile-action><v-icon>far fa-trash</v-icon></v-list-tile-action>
          <v-list-tile-title>Delete</v-list-tile-title>
        </v-list-tile>
        <v-list-tile
          v-if="menu.context && menu.context.type !== 'text/x-directory'"
          class="success--text"
          @click.stop="$content.downloadFile(menu.context); menu.show=false;"
        >
          <v-list-tile-action>
            <v-icon v-if="!isOperationPending">fal fa-cloud-download</v-icon>
            <v-icon v-else>fas fa-circle-notch fa-spin</v-icon>
          </v-list-tile-action>
          <v-list-tile-title>Download</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <v-dialog
      :value="!!renameMenu"
      @input="renameMenu = $event ? renameMenu : null"
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">Rename</span>
        </v-card-title>
        <v-card-text>
          <p>Rename from <code>{{
            renameMenu && (supportedFiles[renameMenu.type].hideExt
            ? renameMenu.filename.replace(/\.[\w-]+$/, '')
            : renameMenu.filename)
          }}</code></p>
          <report-error
            :error="renameError"
            message="An unknown issue occured."
            :data="{renameMenu, newFilename}"
          />
          <v-text-field
            label="New Name"
            :value="renameMenu && renameMenu.filename.replace(/\.[\w-]+$/, '')"
            :suffix="
              renameMenu && !supportedFiles[renameMenu.type].hideExt
              && renameMenu.type !== 'text/x-directory'
                ? `.${renameMenu.filename.split('.').pop()}`
                : ''
            "
            @input="
              newFilename =
                RegExp(`\.${renameMenu.filename.split('.').pop()}$`).test($event.trim())
                || renameMenu.type === 'text/x-directory'
                  ? $event.trim()
                  : `${$event.trim()}.${renameMenu.filename.split('.').pop()}`
            "
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.stop="renameMenu = null">Close</v-btn>
          <v-btn
            color="success" flat
            @click.stop="renameFile();"
            :loading="isOperationPending"
            :disabled="isOperationPending || !newFilename"
          >Change</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import reportError from '@/views/partials/report-error.vue';
import fileIcon from '../fileIcon.vue';
import newButton from '../new/button.vue';
import backBtn from '../back.vue';
import supportedFiles from '../../../supportedFiles';
import prettyName from '../prettyName.vue';

export default {
  components: {
    fileIcon,
    newButton,
    backBtn,
    prettyName,
    reportError,
  },
  props: {
    showHidden: {
      type: Boolean,
      default: localStorage.showHiddenContent === 'true',
    },
  },
  data() {
    return {
      menu: {
        show: false,
        context: null,
        x: 0,
        y: 0,
      },
      maxHeightDir: 'initial',
      maxHeightFile: 'initial',
      supportedFiles,
      renameMenu: null,
      newFilename: '',
      renameError: null,
    };
  },
  computed: {
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('content', { dir: 'current', findContent: 'find', getContent: 'get' }),
    ...mapState('content', ['isOperationPending']),
    ...mapGetters('users', { hasPerm: 'hasPerm' }),
    subdirs() {
      let res = this.findContent({
        query: {
          parent: this.dir._id,
          type: 'text/x-directory',
        },
      }).data;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      res = this.$content._sort(res);
      return res;
    },
    subfiles() {
      let res = this.findContent({
        query: {
          parent: this.dir._id,
          type: { $ne: 'text/x-directory' },
        },
      }).data;
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      res = this.$content._sort(res);
      return res;
    },
    crumbs() {
      if (!this.dir) return [];
      const crumbs = [];
      let curr = this.dir;
      while (curr.parent) {
        crumbs.push({ text: curr.name, to: curr._id });
        curr = this.getContent(curr.parent);
      }
      crumbs.push({ text: '/', to: '' });
      return crumbs.reverse();
    },
  },
  methods: {
    showMenu(e, context) {
      e.preventDefault();
      this.menu.show = false;
      this.menu.x = e.clientX;
      this.menu.y = e.clientY;
      this.menu.context = context;
      this.$nextTick(() => {
        this.menu.show = true;
      });
    },
    setMaxHeight() {
      this.maxHeightDir = 'initial';
      this.maxHeightFile = 'initial';
      this.$nextTick(() => {
        if (this.$refs.subDir) {
          this.maxHeightDir = `${this.$refs.subDir.reduce((a, card) => Math.max(a, card._self.$el.clientHeight), 0)}px`;
        }
        if (this.$refs.subFile) {
          this.maxHeightFile = `${this.$refs.subFile.reduce((a, card) => Math.max(a, card._self.$el.clientHeight), 0)}px`;
        }
      });
    },
    async renameFile() {
      try {
        await this.$content.renameFile(this.renameMenu, this.newFilename);
        this.renameMenu = null;
      } catch (err) {
        console.error(err);
        this.renameError = err;
      }
    },
  },
  watch: {
    dir() { this.setMaxHeight(); },
    renameMenu(v) { if (v) this.newFilename = v.filename; },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setMaxHeight);
  },
  mounted() {
    window.addEventListener('resize', this.setMaxHeight);
    this.setMaxHeight();
  },
};
</script>

<style>
.full-height-cust .flex {
  display: flex;
}

.full-height-cust .flex > .v-card {
  flex: 1 1 auto;
}
</style>
