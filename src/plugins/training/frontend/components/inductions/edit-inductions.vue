<template>
  <v-card>
    <ve-toolbar
      :induction="induction"
      :loading="loading"
      @save="save"
    />
    <v-container grid-list-xs>
      <v-layout row wrap>
        <v-flex xs12 v-if="err">
          <report-error :error="err" />
        </v-flex>
        <v-flex xs12 sm6>
          <v-text-field
            label="Induction Name"
            v-model="induction.name"
          />
        </v-flex>
        <v-flex xs12 sm6 v-if="inductId === 'new'">
          <v-select
            label="Induction Template"
            :items="defaultInductions"
            v-model="inductTemplate"
          />
        </v-flex>
        <v-flex xs12 sm6 v-if="inductId !== 'new'">
          <v-switch
            label="Publish"
            :value="!!induction.published"
            @change="induction.published = $event ? new Date() : null;"
          />
        </v-flex>
        <v-flex xs12 v-if="inductId !== 'new'" style="min-height: 300px">
          <span>Description (optional)</span>
          <md-editor v-model="induction.desc" />
        </v-flex>
        <v-flex xs12 sm6 v-if="inductId !== 'new'">
          <v-switch
            label="Show Inductors to Users"
            v-model="induction.showInductors"
          />
        </v-flex>
        <v-flex xs12 v-if="inductId !== 'new'">
          <v-textarea
            label="Booking Instructions"
            v-model="induction.bookingDesc"
          />
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="inductId !== 'new'">
        <v-flex xs12>
          <h2>Inductors</h2>
          <small>Changes in who can induct will automatically save.</small>
        </v-flex>
        <v-flex xs12>
          <manage-perm :perm="['inductions', inductId, 'inductor']"/>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="inductId !== 'new'">
        <v-flex shrink>
          <h2>Checklist</h2>
        </v-flex>
        <v-spacer/>
        <v-btn
          @click.stop="item = {name: '', desc: ''}; itemAddTo = induction.list; itemDialog = true;"
        >
          <v-icon left>far fa-plus</v-icon>
          <span>Add Section</span>
        </v-btn>
        <v-flex xs12>
          <v-list three-line hover expand>
            <v-list-group
              v-for="(s, i) in rand && induction.list"
              :key="i"
              @click.self.stop=""
              :value="true"
            >
              <v-list-tile slot="activator">
                <v-list-tile-content @click.stop="item = s; itemAddTo = null; itemDialog = true;">
                  <v-list-tile-title class="title">
                    {{i+1}}. {{s.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title v-if="s.desc" class="text-truncate">
                    {{s.desc}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <span>&nbsp;</span>
                  <v-btn
                    @click.stop="
                      item = {name: '', desc: ''};
                      itemAddTo = s.children;
                      itemDialog = true;
                    "
                    flat icon
                  >
                    <v-icon small>fal fa-plus</v-icon>
                  </v-btn>
                  <span>&nbsp;</span>
                </v-list-tile-action>
                <v-list-tile-action>
                  <v-btn flat icon v-if="i - 1 > -1" @click.stop="swap(induction.list, i-1, i)">
                    <v-icon small>fal fa-arrow-up</v-icon>
                  </v-btn>
                  <span v-else>&nbsp;</span>
                  <v-menu offset-y>
                    <v-btn flat icon slot="activator"><v-icon small>fal fa-trash</v-icon></v-btn>
                    <v-list>
                      <v-list-tile @click="itemDelete(induction.list, i)">
                        <v-list-tile-title class="error--text">
                          <v-icon class="error--text" size="20px" left>
                            fas fa-exclamation-triangle
                          </v-icon>
                          Remove
                        </v-list-tile-title>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                  <v-btn
                    flat icon
                    v-if="i + 1 < induction.list.length"
                    @click.stop="swap(induction.list, i, i+1)"
                  >
                    <v-icon small>fal fa-arrow-down</v-icon>
                  </v-btn>
                  <span v-else>&nbsp;</span>
                </v-list-tile-action>
              </v-list-tile>
              <v-list-tile
                v-for="(c, j) in rand && s.children"
                :key="j"
                @click.self.stop=""
              >
                <v-list-tile-action />
                <v-list-tile-content
                  @click.stop="item = c; itemAddTo = null; itemDialog = true;"
                >
                  <v-list-tile-title class="subheading">
                    {{c.name}}
                  </v-list-tile-title>
                  <v-list-tile-sub-title v-if="c.desc" class="text-truncate">
                    {{c.desc}}
                  </v-list-tile-sub-title>
                </v-list-tile-content>
                <v-list-tile-action>
                  <v-btn flat icon v-if="j - 1 > -1" @click.stop="swap(s.children, j-1, j)">
                    <v-icon small>fal fa-arrow-up</v-icon>
                  </v-btn>
                  <span v-else>&nbsp;</span>
                  <v-menu offset-y>
                    <v-btn flat icon slot="activator"><v-icon small>fal fa-trash</v-icon></v-btn>
                    <v-list>
                      <v-list-tile @click="itemDelete(s.children, j)">
                        <v-list-tile-title class="error--text">
                          <v-icon class="error--text" size="20px" left>
                            fal fa-exclamation-triangle
                          </v-icon>
                          Remove
                        </v-list-tile-title>
                      </v-list-tile>
                    </v-list>
                  </v-menu>
                  <v-btn
                    flat icon
                    v-if="j + 1 < s.children.length"
                    @click.stop="swap(s.children, j, j+1)"
                  >
                    <v-icon small>fal fa-arrow-down</v-icon>
                  </v-btn>
                  <span v-else>&nbsp;</span>
                </v-list-tile-action>
              </v-list-tile>
            </v-list-group>
          </v-list>
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="induction.name && induction.name.trim()">
        <v-spacer />
        <v-btn color="primary" :disabled="loading" @click.stop="save">
          <v-icon left :loading="loading">fal fa-save</v-icon>
          Save
        </v-btn>
      </v-layout>
    </v-container>
    <v-dialog
      v-model="itemDialog"
      persistent
      max-width="700px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">
            {{itemAddTo ? 'Add' : 'Update'}}
          </span>
        </v-card-title>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs12>
              <v-text-field
                label="Name"
                v-model="item.name"
              />
            </v-flex>
            <v-flex xs12 style="min-height: 300px">
              <span>Description (optional)</span>
              <md-editor v-model="item.desc" />
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click.native="itemDialog = false">Close</v-btn>
          <v-btn
            color="primary" flat
            @click.native="addItem"
            :disabled="!itemValid"
          >
            {{itemAddTo ? 'Add' : 'Update'}}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import set from 'lodash/set';
import sortBy from 'lodash/sortBy';
import reportError from '@/views/partials/report-error.vue';
import managePerm from '@/views/partials/manage-perm.vue';
import mdEditor from '@/views/partials/md-editor.vue';
import veToolbar from './view-edit-toolbar.vue';
import defaultInductions from './default-inductions';

export default {
  components: {
    veToolbar,
    reportError,
    managePerm,
    mdEditor,
  },
  data() {
    return {
      sortBy,
      induction: { list: [] },
      itemDialog: false,
      itemAddTo: null,
      item: { name: '', desc: '' },
      defaultInductions,
      inductTemplate: [],
      err: null,
      rand: 1.0,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', findUser: 'find' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { getInduct: 'get', findInduct: 'find' }),
    ...mapState('inductions', ['isCreatePending', 'isPatchPending']),
    loading() { return this.isCreatePending || this.isPatchPending; },
    inductId() { return this.$route.params.inductId; },
    itemValid() {
      return this.item.name && this.item.name.trim();
    },
  },
  methods: {
    setInduct() {
      const { Induction } = this.$FeathersVuex;
      if (this.inductId === 'new') {
        this.induction = new Induction();
        return;
      }
      const induction = this.getInduct(this.inductId);
      if (induction) this.induction = induction;
      else this.$router.push('./');
    },
    swap(arr, a, b) {
      const temp = arr[a];
      arr[a] = arr[b];
      arr[b] = temp;
      this.rand = Math.random();
    },
    addItem() {
      if (!this.itemValid) return;
      if (this.itemAddTo === this.induction.list) this.item.children = [];
      if (this.itemAddTo) this.itemAddTo.push(this.item);
      this.item = { name: '', desc: '' };
      this.itemDialog = false;
    },
    itemDelete(arr, i) {
      arr.splice(i, 1);
    },
    async save() {
      if (this.loading) return;
      const errs = { list: [] };
      this.induction.groupId = this.currentGroup._id;
      if (this.inductId === 'new') {
        this.induction.list = this.inductTemplate;
        this.inductTemplate = [];
      }
      try {
        this.induction = await this.induction.save();
        if (this.inductId === 'new' && this.induction) this.$router.push(`./${this.induction._id}?edit`);
      } catch (err) {
        console.error(err);
        if (!err.errors) {
          this.err = err;
          return;
        }
        Object.keys(err.errors).forEach((i) => {
          set(errs, i, err.errors[i].message);
        });
      }
      this.errs = errs;
    },
  },
  mounted() {
    this.setInduct();
  },
  watch: {
    inductId() { this.setInduct(); },
  },
};
</script>
