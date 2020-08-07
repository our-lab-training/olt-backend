<template>
  <v-container grid-list-md>
    <v-layout row wrap justify-center>
      <v-flex xs12 :md4="id" :md6="!id" v-if="!id || this.$vuetify.breakpoint.mdAndUp">
        <v-card>
          <v-toolbar dense>
            <v-toolbar-title>
              Inductions
            </v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p>
              Bellow is a list of the in-person inductions that you
              will need to complete as a part of training.
              Click on one of the inductions to see more details.
            </p>
            <p>
              To see the full list of requirements to become trained, go to
              <router-link to="../training">Training</router-link>.
            </p>
          </v-card-text>
        </v-card>
        &nbsp;
        <list-induct label="My Inductions" filter="inductee"/>
        &nbsp;
        <list-induct label="Give Inductions" filter="inductor"/>
      </v-flex>
      <v-flex xs12 md8 v-if="id">
        <edit-induct v-if="edit" />
        <stat-induct v-else-if="stat" />
        <comp-induct v-else-if="comp" />
        <view-induct v-else />
        &nbsp;
        <msdoc-viewer
          v-if="!edit && !stat && completed && completed.proofId"
          :fileId="completed.proofId"
          title="Completed Induction Evidence"
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
import editInduct from './components/inductions/edit-inductions.vue';
import listInduct from './components/inductions/list-inductions.vue';
import viewInduct from './components/inductions/view-inductions.vue';
import statInduct from './components/inductions/stat-inductions.vue';
import compInduct from './components/inductions/comp-inductions.vue';
import msdocViewer from '../../../plugins/content/frontend/explorer/view/msdoc.vue';

export default {
  components: {
    editInduct,
    listInduct,
    viewInduct,
    statInduct,
    compInduct,
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
    ...mapGetters('inductions', { findLocalInducts: 'find' }),
    ...mapGetters('completed-inductions', { findLocalComps: 'find' }),
    id() { return this.$route.params.inductId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.inductions.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
    stat() { return this.writePerm && typeof this.$route.query.stats !== 'undefined'; },
    comp() { return this.hasPerm(`inductions.${this.id}.inductor`, true); },
    completed() {
      return this.id && this.findLocalComps({
        query: { inductId: this.id, userIds: this.currentUser._id },
      }).data[0];
    },
  },
  methods: {
    ...mapActions('inductions', { findInducts: 'find' }),
    ...mapActions('completed-inductions', { findComps: 'find' }),
    ...mapMutations('inductions', ['setCurrent']),
  },
  async mounted() {
    await this.findInducts({ query: { groupId: this.currentGroup._id } });
    const inductIds = this.findLocalInducts().data.map(ind => ind._id);
    await this.findComps({
      query: { inductId: { $in: inductIds } },
    });
    if (inductIds.includes(this.id)) this.setCurrent(this.id);
  },
  watch: {
    id(v) { this.setCurrent(v); },
  },
};
</script>
