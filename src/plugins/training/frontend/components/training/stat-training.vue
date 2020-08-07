<template>
  <v-card>
    <ve-toolbar
      :training="training"
      :loading="loading"
    />
    <v-container grid-list-xs>
      <v-layout row wrap align-center>
        <v-flex xs12 sm6 md8 lg9>
          <h2>
            Users Completed ({{
              usersData.reduce((a, user) => user.comPerm ? a + 1 : a, 0)
            }}/{{usersData.length}})
          </h2>
        </v-flex>
        <v-flex xs12 sm6 md4 lg3>
          <v-text-field
            append-icon="fal fa-search"
            v-model="search"
          />
        </v-flex>
      </v-layout>
    </v-container>
    <v-data-table
      :headers="[
        {text: 'Username', value: 'username'},
        {text: 'Name', value: 'name'},
        {text: 'Completed?', value: 'comPerm'},
        {text: 'Date Completed', value: 'comPerm.createdAt'},
        {text: 'Evidence', value: 'comPerm.data.proofId'},
      ]"
      :items="usersData"
      class="elevation-1"
      :pagination.sync="pagination"
    >
      <template slot="items" slot-scope="props">
        <td>{{ props.item.username }}</td>
        <td>{{ props.item.name }}</td>
        <td>{{ props.item.comPerm ? 'Yes' : 'No' }}</td>
        <td><span v-if="props.item.comPerm">
          {{ props.item.comPerm.createdAt | moment('DD/MM/YYYY') }}
        </span></td>
        <td><span
          v-if="props.item.comPerm && props.item.comPerm.data && props.item.comPerm.data.proofId"
        >
          <v-tooltip left>
            <v-btn
              icon flat
              :to="`../content/${props.item.comPerm.data.proofId}`"
              slot="activator"
            >
              <v-icon>fal fa-file-contract</v-icon>
            </v-btn>
            <span>View Training Evidence Record</span>
          </v-tooltip>
        </span></td>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import veToolbar from './view-edit-toolbar.vue';

export default {
  components: {
    veToolbar,
  },
  data() {
    return {
      training: { steps: [] },
      search: '',
      err: null,
      rand: 1.0,
      pagination: {
        descending: true,
        page: 1,
        rowsPerPage: 10,
        sortBy: 'Name',
      },
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', findUser: 'find' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('binders', { getBind: 'get', findBind: 'find' }),
    ...mapGetters('trainings', { getTrain: 'get', findTrain: 'find' }),
    ...mapState('trainings', ['isCreatePending', 'isPatchPending', 'isGetPending', 'isFindPending']),
    loading() {
      return this.isCreatePending || this.isPatchPending || this.isGetPending || this.isFindPending;
    },
    bindId() { return this.$route.params.bindId; },
    binder() {
      return this.getBind(this.bindId) || { items: [] };
    },
    usersData() {
      const query = { 'perms.groups': this.currentGroup._id };
      if (this.search && this.search.trim()) {
        const reg = RegExp(`(${this.search.trim().replace(/\s/g, ')|(')})`, 'i');
        query.$or = [
          { username: v => reg.test(v) },
          { name: v => reg.test(v) },
        ];
      }
      return this.findUser({ query }).data
        .map(user => ({
          ...user,
          comPerm: user.perms.userperms.find(p => p.perm.join('.') === `trainings.${this.training._id}.complete`),
        }));
    },
  },
  methods: {
    setTrain() {
      const bindId = (this.binder || {})._id;
      if (!bindId) return this.$router.push('./');
      const [train] = this.findTrain({ query: { bindId } }).data;
      if (!train) return this.$router.push('./');
      this.training = train;
      this.rand = Math.random();
      return train;
    },
    async refresh() {
      const bindId = (this.binder || {})._id;
      await this.$store.dispatch('trainings/find', { query: { bindId } });
      setTimeout(this.setTrain, 1000);
    },
  },
  mounted() {
    this.setTrain();
  },
  watch: {
    binder() {
      this.setTrain();
    },
  },
};
</script>
