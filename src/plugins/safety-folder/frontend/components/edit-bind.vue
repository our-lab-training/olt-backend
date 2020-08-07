<template>
  <v-card>
    <ve-toolbar
      :binder="binder"
      @save="save"
      :loading="loading"
    />
    <v-container grid-list-xs>
      <v-layout row wrap>
        <v-flex v-if="errMsg" xs12>
          <div class="text-center text--error">{{errMsg}}</div>
        </v-flex><v-flex xs12 md6>
          <v-text-field
            v-model="binder.name"
            label="Name"
            required
            :error-messages="errs.name"
            @keyup="errs.name = []"
          />
        </v-flex><v-flex xs12 md6>
          <v-select
            :items="types.binds"
            v-model="binder.type"
            label="Type"
            required
            :error-messages="errs.type"
            @change="errs.type = []"
          />
        </v-flex><v-flex xs12>
          <v-textarea
            v-model="binder.desc"
            label="Description"
            :error-messages="errs.desc"
            @keyup="errs.desc = []"
            :counter="1024"
          />
        </v-flex>
      </v-layout>
      <v-layout v-if="id !== 'new'" row wrap>
        <v-flex shrink>
          <h2>Documents</h2>
        </v-flex>
        <v-spacer/>
        <v-btn @click.stop="itemDialog = true">
          <v-icon left>far fa-plus</v-icon>
          <span>Add Document</span>
        </v-btn>
        <v-flex xs12><v-list>
          <v-list-group
            v-for="cat in Object.keys(items)"
            :key="cat"
            :value="true"
            no-action
          >
            <v-list-tile slot="activator">
              <v-list-tile-content>
                <v-list-tile-title class="header">
                  {{ (type.cats.find(c => c.value === cat) || {}).text }}
                </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-tile
              v-for="(item, i) in items[cat].filter(item => item.data.enabled)"
              :key="i"
              @click.stop=""
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
              <v-list-tile-action>
                <v-tooltip top>
                  <v-btn flat icon slot="activator" :to="`../${item.type}/${item.itemId}`">
                    <v-icon small>fal fa-external-link</v-icon>
                  </v-btn>
                  <span>View Document</span>
                </v-tooltip>
              </v-list-tile-action>
              <v-list-tile-action>
                <v-menu offset-y>
                  <v-btn flat icon slot="activator" @click.prevent="">
                    <v-icon small>fal fa-trash</v-icon>
                  </v-btn>
                  <v-list>
                    <v-list-tile @click="binder.items.splice(i, 1)">
                      <v-list-tile-title class="error--text">
                        <v-icon class="error--text" size="20px" left>
                          fas fa-exclamation-triangle
                        </v-icon> Remove
                      </v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
              </v-list-tile-action>
            </v-list-tile>
          </v-list-group>
        </v-list></v-flex>
      </v-layout>
      <v-layout row wrap>
        <v-btn color="primary" :disabled="loading" @click.stop="save">
          <v-icon left :loading="loading">fal fa-save</v-icon>
          {{id === 'new' ? 'Continue' : 'Save'}}
        </v-btn>
      </v-layout>
    </v-container>
    <v-dialog v-model="itemDialog" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Add Document</span>
        </v-card-title>
        <v-container grid-list-md>
          <v-layout wrap>
            <!-- <v-flex xs12 sm6>
              <v-text-field label="Document Name" required/>
            </v-flex> -->
            <v-flex xs12>
              <v-select
                label="Category"
                required
                :items="(type || {}).cats"
                v-model="newItem.category"
              />
            </v-flex>
          </v-layout>
          <upload-choose-input
            v-if="
              newItem.category
              && newItem.category !== 'induct'
              && newItem.category !== 'quiz'
            "
            :path="`Binders/${id}/`"
            v-model="newItem.itemId"
            :save.sync="uploadSave"
            :valid.sync="uploadValid"
          />
          <v-select
            v-if="newItem.category === 'induct'"
            :items="
              findInduct({
                query: {
                  $or: [{ groupId: currentGroup._id }, { public: true }],
                  $sort: { name: 1 },
                },
              }).data
            "
            item-text="name"
            item-value="_id"
            v-model="newItem.itemId"
            label="Induction"
          ></v-select>
        </v-container>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click.native="itemDialog = false">Close</v-btn>
          <v-btn
            color="primary" flat
            @click.native="dialogAdd"
            :disabled="isOperationPending || !dialogValid"
            :loading="isOperationPending"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import groupBy from 'lodash/groupBy';
import set from 'lodash/set';
import uploadChooseInput from '../../../content/frontend/upload-choose-input.vue';
import veToolbar from './view-edit-toolbar.vue';
import types from '../../types';
import supportedFiles from '../../../content/supportedFiles';

export default {
  components: {
    veToolbar,
    uploadChooseInput,
  },
  data() {
    return {
      binder: { items: [] },
      types,
      errs: { items: [] },
      errMsg: '',
      itemDialog: false,
      newItem: {},
      uploadSave: null,
      uploadValid: false,
      supportedFiles,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get' }),
    ...mapGetters('inductions', { getInduct: 'get', findInduct: 'find' }),
    ...mapState('binders', ['isCreatePending', 'isPatchPending']),
    ...mapState('content', ['isOperationPending']),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binders.write`); },
    loading() { return this.isCreatePending || this.isPatchPending; },
    type() { return this.types.binds.find(t => t.value === this.binder.type); },
    items() {
      const items = groupBy(cloneDeep(this.binder.items), 'category');
      Object.values(items).forEach(catItems => catItems.forEach((item) => {
        item.data = this.$store.getters[`${item.type}/get`](item.itemId) || {};
      }));
      return items;
    },
    dialogValid() {
      if (!this.newItem.category) return false;
      switch (this.newItem.category) {
        case 'induct':
          return !!this.newItem.itemId;
        case 'quiz':
          return false;
        default:
          return this.uploadValid;
      }
    },
  },
  methods: {
    setBind() {
      const { Binder } = this.$FeathersVuex;
      if (this.id !== 'new') {
        const bind = this.getBind(this.id);
        if (!bind) return this.$router.push('./');
        this.binder = bind.clone();
      } else this.binder = new Binder();
      return this.binder;
    },
    async save() {
      if (this.loading) return;
      const errs = { items: [] };
      this.binder.groupId = this.currentGroup._id;
      try {
        this.binder = await this.binder.save();
        if (this.id === 'new') this.$router.push(`./${this.binder._id}?edit`);
      } catch (err) {
        console.error(err);
        if (!err.errors) {
          this.errMsg = 'An unknown error has occured, please contact an administrator.';
          return;
        }
        Object.keys(err.errors).forEach((i) => {
          set(errs, i, err.errors[i].message);
        });
      }
      this.errs = errs;
    },
    async dialogAdd() {
      if (!this.dialogValid) return;
      switch (this.newItem.category) {
        case 'induct':
          this.newItem.type = 'inductions';
          break;
        case 'quiz':
          this.newItem.type = 'quizzes';
          return;
        default:
          this.newItem.type = 'content';
          this.newItem.itemId = await this.uploadSave();
      }
      this.binder.items.push(this.newItem);
      this.newItem = {};
      this.itemDialog = false;
    },
  },
  mounted() {
    if (!this.writePerm) this.$router.push('/');
    this.setBind();
  },
  watch: {
    id() {
      this.setBind();
    },
  },
};
</script>
