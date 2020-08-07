<template>
  <v-card>
    <ve-toolbar
      :induction="induction"
    />
    <v-card-text>
      <report-error :error="err" />
      <v-layout row wrap justify-center v-if="!comp || !begun">
        <v-btn
          color="success"
          @click.stop="begin"
        >
          Begin Induction
        </v-btn>
      </v-layout>
      <v-layout row wrap v-else>
        <v-flex xs12 v-if="induction.desc">
          <md-viewer :value="induction.desc"/>
        </v-flex>
        <v-flex xs12>
          <h2 class="title">Checklist</h2>
          <small>
            Check off each relevant criteria covered for every section
            by clicking the box on the right.
          </small>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-list two-line expand v-if="comp && begun">
      <v-list-group
        :value="true"
        v-for="(section, i) in comp.list"
        :key="i"
        no-action
      >
        <v-list-tile slot="activator">
          <v-list-tile-content @click.stop="showMore(i, -1)">
            <v-list-tile-title>
              {{i+1}}. {{section.name}}
            </v-list-tile-title>
            <v-list-tile-sub-title v-if="section.desc">
              {{section.desc}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
        <v-list-tile
          v-for="(child, j) in section.children"
          :key="j"
          @click="Math.random()"
        >
          <v-list-tile-content
            @click.left="showMore(i, j)"
            @click.right.prevent="child.checked = !child.checked"
          >
            <v-list-tile-title>
              {{child.name}}
            </v-list-tile-title>
            <v-list-tile-sub-title v-if="child.desc">
              {{child.desc}}
            </v-list-tile-sub-title>
          </v-list-tile-content>
          <v-list-tile-action>
            <v-checkbox v-model="child.checked" />
          </v-list-tile-action>
        </v-list-tile>
      </v-list-group>
    </v-list>
    <v-card-text v-if="comp && begun">
      <v-layout row wrap>
        <v-flex>
          <h2 class="title">Inducted Users</h2>
        </v-flex>
        <v-spacer/>
        <v-btn flat color="primary" @click="userDialog = true">
          <v-icon left>fal fa-plus</v-icon>
          Add User
        </v-btn>
        <v-flex xs12>
          <v-chip
            v-for="(user, i) in comp.userIds.map(getUser)"
            :key="i"
          >
            {{user.name}} ({{user.username}})
          </v-chip>
        </v-flex>
      </v-layout>
    </v-card-text>
    <v-dialog v-model="showMoreData.dialog" persistent max-width="500">
      <v-card>
        <span
          v-shortkey.once="['arrowdown']"
          @shortkey="showMoreData.dialog && showMore(showMoreData.i, showMoreData.j+1, true)"
        />
        <span
          v-shortkey.once="['arrowright']"
          @shortkey="showMoreData.dialog && showMore(showMoreData.i, showMoreData.j+1, true)"
        />
        <span
          v-shortkey.once="['arrowup']"
          @shortkey="showMoreData.dialog && showMore(showMoreData.i, showMoreData.j-1)"
        />
        <span
          v-shortkey.once="['arrowleft']"
          @shortkey="showMoreData.dialog && showMore(showMoreData.i, showMoreData.j-1)"
        />
        <v-card-title class="headline">{{showMoreData.item.name}}</v-card-title>
        <v-card-text>
          <md-viewer :value="showMoreData.item.desc"/>
        </v-card-text>
        <v-card-actions>
          <v-tooltip top>
            <v-btn
              slot="activator"
              icon flat
              @click="showMore(showMoreData.i, showMoreData.j - 1)"
            >
              <v-icon>far fa-arrow-left</v-icon>
            </v-btn>
            <span>Up or Left Arrow Key</span>
          </v-tooltip>
          <v-spacer></v-spacer>
          <v-btn flat @click="showMore()">Close</v-btn>
          <v-tooltip top v-if="!showMoreData.item.checked">
            <v-btn
              slot="activator"
              color="success" flat
              @click="showMore(showMoreData.i, showMoreData.j + 1, true)"
            >
              {{!showMoreData.isSection ? 'Mark Done and' : ''}} Next
            </v-btn>
            <span>Down or Right Arrow Key</span>
          </v-tooltip>
          <v-btn
            v-if="!showMoreData.isSection && showMoreData.item.checked"
            color="error" flat
            @click="showMoreData.item.checked = false; showMore()"
          >
            Mark Undone
          </v-btn>
          <v-btn
            icon flat
            @click="showMore(showMoreData.i, showMoreData.j + 1)"
          >
            <v-icon>far fa-arrow-right</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="userDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <div>
            <span class="headline">Digital Signature</span><br>
            <span>Use your Pheme login as a digital signature.</span><br>
            <report-error :error="err" />
            <span v-if="loginErr" class="error--text">{{loginErr}}</span>
          </div>
        </v-card-title>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs12>
              <v-text-field
                label="Pheme Number"
                v-model="user.username"
                required
                :rules="[v => /^\d{8}$/.test(v) || 'Invalid Pheme Number.']"
                validate-on-blur
                :counter="8"
              />
            </v-flex>
            <v-flex xs12>
              <v-text-field
                label="Password"
                v-model="user.password"
                type="password"
                :rules="[v => /.{1}/.test(v) || 'Password is required.']"
              />
            </v-flex>
            <v-flex xs12>
              <v-checkbox :label="agreeText" v-model="user.agree" />
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click.native="userDialog = false; resetUser();">Close</v-btn>
          <v-btn
            color="success" flat
            :disabled="!userValid || loading"
            :loading="loading"
            @click.stop="addUser()"
          >Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card-actions v-if="comp && begun">
      <v-spacer/>
      <v-btn
        color="success" flat
        @click.stop="finish"
        :disabled="!comp.userIds.find(uid => typeof uid === 'string')"
        :loading="loading"
      >Finish</v-btn>
    </v-card-actions>
    <v-snackbar
      v-model="success"
      color="success"
      :timeout="10000"
    >
      Induction succesfully submitted and saved!
      <v-btn dark flat icon @click="success = false">
        <v-icon>fal fa-times</v-icon>
      </v-btn>
    </v-snackbar>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import reportError from '@/views/partials/report-error.vue';
import mdViewer from '@/views/partials/md-viewer.vue';
import veToolbar from './view-edit-toolbar.vue';

export default {
  components: {
    veToolbar,
    reportError,
    mdViewer,
  },
  data() {
    return {
      rand: 0,
      comp: null,
      user: { username: '', password: '', agree: false },
      userDialog: false,
      agreeText: 'I acknowledge receipt of this health and safety induction and have received the necessary information, instruction and training required to enable me to work safely.',
      success: '',
      err: null,
      loginErr: '',
      showMoreData: { item: {} },
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', getUser: 'get' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { getInduct: 'get', findInduct: 'find', induction: 'current' }),
    ...mapState('completed-inductions', ['isCreatePending', 'isPatchPending']),
    loading() { return this.isCreatePending || this.isPatchPending; },
    inductId() { return this.$route.params.inductId; },
    userValid() {
      return /^\d{8}$/.test(this.user.username) && this.user.password && this.user.agree;
    },
    begun() { return typeof this.$route.query.begun !== 'undefined'; },
  },
  methods: {
    begin() {
      this.err = null;
      const { CompletedInduction } = this.$FeathersVuex;
      this.comp = new CompletedInduction({
        list: this.induction.list.map(section => ({
          ...section,
          children: section.children.map(child => ({ ...child, checked: false })),
        })),
        inductId: this.inductId,
      });
      this.$router.push('?begun');
    },
    resetUser() { this.user = { username: '', password: '', agree: false }; },
    async addUser() {
      if (this.loading || !this.userValid) return;
      this.err = null;
      this.loginErr = '';
      this.comp.users = [this.user];
      try {
        this.comp = await this.comp.save();
        this.userDialog = false;
        this.resetUser();
      } catch (err) {
        console.error(err);
        if (err.code === 401) this.loginErr = err.message;
        else this.err = err;
      }
    },
    async finish() {
      this.err = null;
      if (this.loading) return;
      this.comp.done = true;
      try {
        await this.comp.save();
        this.comp = null;
        this.success = true;
      } catch (err) {
        console.error(err);
        this.err = err;
      }
    },
    showMore(i = -1, j = -1, checked) {
      if (typeof checked !== 'undefined') this.showMoreData.item.checked = checked;
      if (j === -2) {
        i -= 1;
        j = this.comp.list[i] && this.comp.list[i].children.length - 1;
      }
      const isSection = this.comp.list[i] && !this.comp.list[i].children[j];
      if (isSection && j > -1) i += 1;
      this.showMoreData = !this.comp.list[i]
        ? { item: {}, dialog: false }
        : {
          i,
          j: !isSection ? j : -1,
          isSection,
          item: isSection ? this.comp.list[i] : this.comp.list[i].children[j],
          dialog: true,
        };
    },
  },
};
</script>
