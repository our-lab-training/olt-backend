<template>
  <v-card>
    <ve-toolbar
      :induction="induction"
      :loading="loading"
    />
    <v-container grid-list-xs>
      <v-layout row wrap align-center v-if="inductId !== 'new'">
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
        {text: 'Inducted By', value: 'inductor.name'},
        {text: 'Evidence', value: 'completed.proofId', sortable: false},
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
          {{
            props.item.comPerm.completedAt || props.item.comPerm.createdAt
            | moment('DD/MM/YYYY')
          }}
        </span></td>
        <td><span v-if="props.item.inductor">
          {{ props.item.completed.inductorName || props.item.inductor.name }}
        </span></td>
        <td><span v-if="props.item.completed && props.item.completed.proofId">
          <v-tooltip left>
            <v-btn
              icon flat
              :to="`../content/${props.item.completed.proofId}`"
              slot="activator"
            >
              <v-icon>fal fa-file-contract</v-icon>
            </v-btn>
            <span>View Induction Evidence Record</span>
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
    ...mapGetters('users', {
      hasPerm: 'hasPerm',
      currentUser: 'current',
      findUser: 'find',
      getUser: 'get',
    }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { getInduct: 'get', findInduct: 'find', induction: 'current' }),
    ...mapState('inductions', ['isCreatePending', 'isPatchPending', 'isGetPending']),
    ...mapGetters('completed-inductions', { findComps: 'find' }),
    loading() { return this.isCreatePending || this.isPatchPending || this.isGetPending; },
    inductId() { return this.$route.params.inductId; },
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
        .map((user) => {
          const completed = this.findComps({
            query: { userIds: user._id, inductId: this.inductId },
          }).data.pop();
          const inductor = completed && this.getUser(completed.inductorId || completed.createdBy);
          return {
            ...user,
            comPerm: user.perms.userperms.find(p => p.perm.join('.') === `inductions.${this.inductId}.complete`),
            completed,
            inductor,
          };
        });
    },
  },
};
</script>
