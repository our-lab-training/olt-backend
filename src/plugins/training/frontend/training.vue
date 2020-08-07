<template>
  <v-container grid-list-md>
    <v-layout row wrap justify-center>
      <v-flex xs12 :md4="id" :md6="!id" v-if="!id || this.$vuetify.breakpoint.mdAndUp">
        <v-card>
          <v-toolbar dense>
            <v-toolbar-title>
              Training
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>
              Bellow is a list of the training modules you will need to
              complete in order to use/undertake the relative
              task, tool, or workspace.
            </p>
            <p>
              Click on one of the modules to see the list of tasks required
              to complete the training. Clicking on a task will take you to
              the relevant information, you can then click back to return here.
            </p>
          </v-card-text>
        </v-card>
        &nbsp;
        <list-train />
      </v-flex>
      <v-flex xs12 md8 v-if="id">
        <edit-train v-if="edit" />
        <stat-train v-else-if="stat" />
        <view-train v-else />
        &nbsp;
        <msdoc-viewer
          v-if="!edit && !stat && train && train.proofId"
          :fileId="train.proofId"
          title="Completed Training Evidence"
          :back="false"
          :hidden.sync="hidden"
          toggle-hidden
        />
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import { mapActions, mapGetters, mapMutations } from 'vuex';
import editTrain from './components/training/edit-training.vue';
import listTrain from './components/training/list-training.vue';
import viewTrain from './components/training/view-training.vue';
import statTrain from './components/training/stat-training.vue';
import msdocViewer from '../../../plugins/content/frontend/explorer/view/msdoc.vue';

export default {
  components: {
    editTrain,
    listTrain,
    viewTrain,
    statTrain,
    msdocViewer,
  },
  data() {
    return {
      hidden: true,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('trainings', { findTrain: 'find' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binder.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
    stat() { return this.writePerm && typeof this.$route.query.stats !== 'undefined'; },
    train() { return this.findTrain({ query: { bindId: this.id } }).data[0]; },
  },
  methods: {
    ...mapActions('binders', ['find']),
    ...mapMutations('binders', ['setCurrent']),
  },
  async mounted() {
    await this.find({ query: { groupId: this.currentGroup._id } });
  },
  watch: {
    id(v) { this.setCurrent(v); },
  },
};
</script>
