<template>
  <v-card>
    <ve-toolbar
      :training="training"
      @refresh="refresh();"
    />
    <v-list two-line>
      <v-list-tile
        v-for="step in training.steps"
        :key="step.rand"
        :href="step.type === 'comment-link' && step.link ? step.link : ''"
        :target="step.type === 'comment-link' && step.link ? '_blank' : ''"
        :to="step.type === 'doc' ? `../${step.docType}/${step.data.itemId}` : ''"
      >
        <v-list-tile-content>
          <v-list-tile-title>
            {{step.count ? `${step.count}.` : ''}} {{step.name}}
            <v-icon right size="20" v-if="step.type === 'comment-link' && step.link">
              fal fa-external-link
            </v-icon>
          </v-list-tile-title>
          <v-list-tile-sub-title
            v-if="step.required"
            :class="step.complete ? 'success--text' : 'error--text'"
          >
            <v-icon small left :color="step.complete ? 'success' : 'error'">
              fal fa-{{step.complete ? 'check-square' : 'times-square'}}
            </v-icon>
            {{rand && step.complete ? 'Completed' : 'Incomplete'}}
          </v-list-tile-sub-title>
        </v-list-tile-content>
        <v-list-tile-action v-if="showAccept(step)">
          <v-layout row justify-center>
            <v-dialog v-model="step.dialog" persistent max-width="290">
              <v-btn style="padding: 0 0.5em;" slot="activator" @click.prevent="">
                <v-icon left>fal fa-file-check</v-icon> Mark Read
              </v-btn>
              <v-card>
                <v-card-title class="headline">
                  You have Reviewed and Agree to the Following:
                </v-card-title>
                <v-card-text>{{step.name}}</v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="error" flat @click.native="step.dialog = false">Disagree</v-btn>
                  <v-btn
                    color="success" flat
                    @click.native="accept(step)"
                    :loading="isCreatePending"
                  >
                    Agree
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-layout>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import types from '../../../types';
import veToolbar from './view-edit-toolbar.vue';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      training: { steps: [] },
      rand: 0,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get', findBind: 'find' }),
    ...mapGetters('trainings', { getTrain: 'get', findTrain: 'find' }),
    ...mapState('perms', ['isCreatePending']),
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
  },
  methods: {
    setTrain() {
      const bindId = (this.binder || {})._id;
      if (!bindId) return this.$router.push('./');
      const [train] = this.findTrain({ query: { bindId } }).data;
      if (!train) return this.$router.push('./');
      let c = 1;
      train.steps.forEach((step) => {
        if (step.type === 'doc') step.data = this.binder.items.find(i => i._id === step.docId);
        if (step.required) {
          step.count = c;
          c += 1;
        }
      });
      this.training = train;
      // this.training.steps.forEach((s) => { s.complete = s.complete ? Math.random() : false; });
      this.rand = Math.random();
      return train;
    },
    showAccept(step) {
      return !step.complete
        && step.required
        && (
          step.type === 'comment-link'
          || (step.type === 'doc' && step.data.type === 'content')
        );
    },
    async refresh() {
      const bindId = (this.binder || {})._id;
      await this.$store.dispatch('trainings/find', { query: { bindId } });
      setTimeout(this.setTrain, 1000);
    },
    async accept(step) {
      if (step.complete) return;
      const { Perm } = this.$FeathersVuex;
      const perm = new Perm({
        perm: ['trainings', step._id, 'accept'],
        grantee: this.$store.state.auth.payload.userId,
        type: 'users',
      });
      await perm.save();
      step.dialog = false;
      await this.refresh();
    },
  },
  mounted() {
    this.setTrain();
  },
  watch: {
    bindId() {
      this.setTrain();
    },
  },
};
</script>
