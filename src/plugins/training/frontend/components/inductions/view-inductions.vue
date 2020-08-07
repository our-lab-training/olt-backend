<template>
  <v-card>
    <ve-toolbar
      :induction="induction"
      @refresh="refresh();"
    />
    <v-card-text v-if="induction.bookingDesc">
      {{induction.bookingDesc}}
    </v-card-text>
    <v-card-title class="title" v-if="induction.showInductors">
      Inductors:
    </v-card-title>
    <v-list two-line v-if="induction.showInductors">
      <template
        v-for="inductor in inductors"
      >
        <v-divider :key="inductor._id+'div'"/>
        <v-list-tile :key="inductor._id">
          <v-list-tile-content>
            <v-list-tile-title>
              {{inductor.name}}
            </v-list-tile-title>
            <v-list-tile-sub-title>
              <a
                :href="`mailto:${inductor.email}`"
                target="_blank"
              >
                {{inductor.email}}
              </a>
            </v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>
      </template>
    </v-list>

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
      rand: 0,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current', findUser: 'find' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { getInduct: 'get', findInduct: 'find', induction: 'current' }),
    ...mapState('perms', ['isCreatePending']),
    inductId() { return this.$route.params.inductId; },
    completed() { return this.hasPerm(`inductions.${this.inductId}.complete`, true); },
    inductors() {
      return this.findUser({
        query: {
          'perms.groups': this.currentGroup._id,
          'perms.all': v => v.join('.') === `inductions.${this.inductId}.inductor`,
        },
      }).data;
    },
  },
  methods: {
    async refresh() {
      const inductId = (this.induction || {})._id;
      await this.$store.dispatch('inductions/get', inductId);
    },
  },
};
</script>
