<template>
  <v-card>
    <ve-toolbar
      :training="training"
      :loading="loading"
      @save="save"
    />
    <v-container grid-list-xs>
      <v-layout row wrap>
        <v-flex xs12 sm6>
          <v-select
            label="Document Set"
            :disabled="bindId !== 'new'"
            :items="bindId === 'new' ? binds : [binder]"
            item-text="name"
            item-value="_id"
            :value="training.bindId"
            @input="$router.push(`./${$event}?edit`)"
          />
        </v-flex>
        <v-flex xs12 sm6 v-if="bindId !== 'new'">
          <v-text-field
            label="Training Name"
            v-model="training.name"
          />
        </v-flex>
        <v-flex xs12 sm6 v-if="bindId !== 'new'">
          <v-switch
            label="Publish"
            :value="!!training.published"
            @change="training.published = $event ? new Date() : null;"
          />
        </v-flex>
      </v-layout>
      <v-layout row wrap v-if="bindId !== 'new'">
        <v-flex shrink>
          <h2>Steps</h2>
        </v-flex>
        <v-spacer/>
        <v-btn @click.stop="step = {required: true}; stepDialog = true;">
          <v-icon left>far fa-plus</v-icon>
          <span>Add Step</span>
        </v-btn>
        <v-flex xs12><v-list>
          <v-list three-line hover>
            <v-list-tile
              v-for="(s, i) in sortBy(training.steps, 'index')"
              :key="i"
              @click.stop=""
            >
              <v-list-tile-content @click="step = s; stepDialog = true;">
                <v-list-tile-title v-text="s.name" />
                <v-list-tile-sub-title>
                  Type: {{
                    (types.steps.find(t => t.value === s.type) || {}).text
                  }} {{
                    s.required ? '' : '(optional)'
                  }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title v-if="s.type === 'doc'">
                  {{
                    getItem(s.docId).catName
                  }} -> {{
                    getItem(s.docId).type === 'content'
                    && supportedFiles[getItem(s.docId).data.type].hideExt
                      ? getItem(s.docId).data.filename.replace(/\.[\w-]+$/, '')
                      : getItem(s.docId).data.name
                  }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title v-if="s.type === 'perm-timout'">
                  {{(otherTrains.find(t => t._id === perm2trainId(s.perm)) || {}).name}}
                  {{s.duration
                    ? ` (${s.duration} day${s.duration === 1 ? '' : 's'} cooldown)`
                    : ''
                  }}
                </v-list-tile-sub-title>
                <v-list-tile-sub-title v-if="s.type === 'comment-link' && s.link">
                  <a :href="s.link" target="_blank">{{s.link}}</a>
                </v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn flat icon v-if="s.index - 1 > -1" @click.stop="swap(s.index-1, s.index)">
                  <v-icon small>fal fa-arrow-up</v-icon>
                </v-btn>
                <span v-else>&nbsp;</span>
                <v-menu offset-y>
                  <v-btn flat icon slot="activator"><v-icon small>fal fa-trash</v-icon></v-btn>
                  <v-list>
                    <v-list-tile @click="stepDelete(s.index)">
                      <v-list-tile-title class="error--text">
                        <v-icon class="error--text" size="20px" left>
                          fal fa-exclamation-triangle
                        </v-icon> Remove
                      </v-list-tile-title>
                    </v-list-tile>
                  </v-list>
                </v-menu>
                <v-btn
                  flat icon
                  v-if="s.index + 1 < training.steps.length"
                  @click.stop="swap(s.index, s.index+1)"
                >
                  <v-icon small>fal fa-arrow-down</v-icon>
                </v-btn>
                <span v-else>&nbsp;</span>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-list></v-flex>
      </v-layout>
      <v-layout row wrap v-if="bindId !== 'new'">
        <v-spacer />
        <v-btn color="primary" :disabled="loading" @click.stop="save">
          <v-icon left :loading="loading">fal fa-save</v-icon>
          Save
        </v-btn>
      </v-layout>
    </v-container>
    <v-dialog
      v-model="stepDialog"
      persistent
      max-width="500px"
    >
      <v-card>
        <v-card-title>
          <span class="headline">{{typeof step.index !== 'number' ? 'Add' : 'Update'}} Step</span>
        </v-card-title>
        <v-container grid-list-md>
          <v-layout row wrap>
            <v-flex xs12 sm6>
              <v-select
                label="Step Type"
                required
                :items="types.steps"
                v-model="step.type"
              />
            </v-flex>
            <v-flex xs12 sm6 v-if="step.type === 'doc'">
              <v-select
                label="Document"
                required
                :items="binder.items.filter(
                  i => !training.steps.find(s => s.docId === i._id && s.docId !== step.docId)
                )
                "
                item-text="data.name"
                item-value="_id"
                v-model="step.docId"
                @input="
                  const item = binder.items.find(i=>i._id === $event);
                  step.name =
                    `${
                      item.type === 'content' ? 'Review' : 'Complete'
                    } ${item.data.name.replace(/\.[\w-]+$/, '')}`;
                  step.docType = item.type;
                "
              >
                <template slot="item" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title>
                      {{
                        data.item.type === 'content'
                        && supportedFiles[data.item.data.type].hideExt
                          ? data.item.data.filename.replace(/\.[\w-]+$/, '')
                          : data.item.data.name
                      }}
                    </v-list-tile-title>
                    <v-list-tile-sub-title>{{data.item.catName}}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
                <template slot="selection" slot-scope="data">
                  <v-list-tile-content>
                    <v-list-tile-title>
                      {{
                        data.item.type === 'content'
                        && supportedFiles[data.item.data.type].hideExt
                          ? data.item.data.filename.replace(/\.[\w-]+$/, '')
                          : data.item.data.name
                      }}
                    </v-list-tile-title>
                    <v-list-tile-sub-title>{{data.item.catName}}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </template>
              </v-select>
            </v-flex>
            <v-flex xs12 sm6 v-if="step.type === 'perm-timeout'">
              <v-select
                label="Training Module"
                required
                :items="otherTrains"
                item-text="name"
                item-value="_id"
                :value="trainId"
                @input="
                  step.perm = `${currentGroup._id}.training.${$event}.complete`
                  step.name = `Finish ${otherTrains.find(i=>i._id === $event).name} Training.`
                "
              />
            </v-flex>
            <v-flex
              xs12 sm6
              v-if="
                step.type
                && (step.type !== 'doc' || step.docId)
                && (step.type !== 'perm-timeout' || trainId)
              "
            >
              <v-text-field label="Step Name" required v-model="step.name"/>
            </v-flex>
            <v-flex xs12 sm6 v-if="step.type === 'perm-timeout' && trainId">
              <v-text-field
                label="Cooldown Duration (days)"
                note="Days to wait after training is completed. 0 = none."
                required
                :value="step.duration || 0"
                @input="step.duration = $event"
                min="0"
                max="365"
                step="1"
              />
            </v-flex>
            <v-flex xs12 v-if="step.type === 'comment-link'">
              <v-text-field
                label="Link"
                note="(optional) Starts with http:// or https://"
                required
                type="url"
                :value="step.link || ''"
                @input="step.link = $event"
              />
            </v-flex>
            <v-flex xs12 sm6 v-if="step.type">
              <v-switch
                label="Required"
                v-model="step.required"
              />
            </v-flex>
          </v-layout>
        </v-container>
        <v-card-actions>
          <v-spacer/>
          <v-btn flat @click.native="stepDialog = false">Close</v-btn>
          <v-btn
            color="primary" flat
            @click.native="stepAdd"
            :disabled="!stepValid"
          >
            {{typeof step.index !== 'number' ? 'Add' : 'Update'}}
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
import veToolbar from './view-edit-toolbar.vue';
import types from '../../../types';
import supportedFiles from '../../../../content/supportedFiles';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      sortBy,
      training: { steps: [] },
      stepDialog: false,
      step: { required: true },
      types,
      supportedFiles,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', findUser: 'find' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get', findBind: 'find' }),
    ...mapGetters('trainings', { getTrain: 'get', findTrain: 'find' }),
    ...mapState('trainings', ['isCreatePending', 'isPatchPending']),
    loading() { return this.isCreatePending || this.isPatchPending; },
    bindId() { return this.$route.params.bindId; },
    binder() {
      const bind = this.getBind(this.bindId) || { items: [] };
      const type = types.binds.find(t => t.value === bind.type) || { cats: [] };
      bind.items.forEach((i) => {
        i.data = this.$store.getters[`${i.type}/get`](i.itemId) || {};
        i.catName = (type.cats.find(c => c.value === i.category) || {}).text;
      });
      return bind;
    },
    getItem() {
      return docId => (this.binder.items.find(i => i._id === docId) || { data: { name: '' } });
    },
    otherTrains() {
      return this.findTrain({
        query: {
          bindId: { $ne: this.bindId },
          $or: [
            { groupId: this.currentGroup._id },
            { public: true },
          ],
        },
      }).data;
    },
    binds() {
      return this.findBind({
        query: {
          _id: { $nin: this.otherTrains.map(t => t.bindId) },
          groupId: this.currentGroup._id,
        },
      }).data;
    },
    trainId() { return this.perm2trainId(this.step.perm); },
    stepValid() {
      return this.step.type && this.step.name
      && (
        (this.step.type === 'doc' && this.step.docId)
        || (
          this.step.type === 'perm-timeout' && this.trainId
          && this.step.duration >= 0 && this.step.duration <= 365
        )
        || this.step.type === 'comment-link'
      );
    },
  },
  methods: {
    setTrain() {
      if (this.bindId === 'new') return null;
      const { Training } = this.$FeathersVuex;
      const bindId = (this.binder || {})._id;
      if (!bindId) return this.$router.push('./');
      let [train] = this.findTrain({ query: { bindId } }).data;
      if (!train) {
        train = new Training({
          bindId,
          groupId: this.currentGroup._id,
          name: `${this.binder.name} Training`,
        });
      }
      this.training = train;
      return train;
    },
    swap(a, b) {
      this.training.steps.forEach((s) => {
        if (s.index === a) s.index = b;
        else if (s.index === b) s.index = a;
      });
      this.training.steps = sortBy(this.training.steps, 'index');
    },
    stepAdd() {
      const steps = sortBy(this.training.steps, 'index');
      if (typeof this.step.index !== 'number') {
        this.step.index = this.training.steps.length;
        steps.push(this.step);
      } else steps.splice(this.step.index, 1, this.step);
      this.training.steps = steps;
      this.step = {};
      this.stepDialog = false;
    },
    stepDelete(i) {
      const steps = sortBy(this.training.steps, 'index');
      steps.splice(i, 1);
      steps.forEach((s, index) => { s.index = index; });
      this.training.steps = steps;
    },
    perm2trainId(perm) {
      return perm
        ? (perm.match(/(trainings?\.)[0-9abcdef]{24}(?=\.complete)/) || [''])[0].replace(/trainings?\./, '')
        : null;
    },
    async save() {
      if (this.loading) return;
      const errs = { steps: [] };
      this.training.groupId = this.currentGroup._id;
      try {
        this.training = await this.training.save();
        if (this.id === 'new') this.$router.push(`./${this.training._id}?edit`);
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
    log(...m) { console.log(...m); },
  },
  mounted() {
    this.setTrain();
  },
  watch: {
    binder() { this.setTrain(); },
  },
};
</script>
