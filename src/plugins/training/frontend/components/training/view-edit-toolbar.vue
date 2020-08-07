<template>
  <v-toolbar dense>
    <v-tooltip top>
      <v-btn
        slot="activator"
        @click.stop="$router.go(-1)"
        flat icon
      >
        <v-icon>far fa-arrow-left</v-icon>
      </v-btn>
      <span>Back</span>
    </v-tooltip>
    <v-toolbar-title>
      {{id === 'new' ? 'New Training' : training.name}}
    </v-toolbar-title>
    <v-spacer />
    <v-tooltip v-if="stat || edit" top>
      <v-btn
        slot="activator"
        to="?view"
        flat icon
        :disabled="disabled"
      >
        <v-icon>fal fa-eye</v-icon>
      </v-btn>
      <span>View</span>
    </v-tooltip>
    <v-tooltip v-if="writePerm && !stat" top>
      <v-btn
        slot="activator"
        to="?stats"
        flat icon
        :disabled="disabled"
      >
        <v-icon>fal fa-chart-bar</v-icon>
      </v-btn>
      <span>Stats</span>
    </v-tooltip>
    <v-tooltip v-if="writePerm && !edit" top>
      <v-btn
        slot="activator"
        to="?edit"
        flat icon
        :disabled="disabled"
      >
        <v-icon>fal fa-pencil</v-icon>
      </v-btn>
      <span>Edit</span>
    </v-tooltip>
    <v-tooltip v-if="edit && id !== 'new'" top>
      <v-btn
        slot="activator"
        @click.stop="$emit('save')"
        flat icon
        :disabled="disabled || loading"
        :loading="loading"
      >
        <v-icon>fal fa-save</v-icon>
      </v-btn>
      <span>Save</span>
    </v-tooltip>
    <v-tooltip v-if="!edit" top>
      <v-btn
        slot="activator"
        flat icon
        @click.stop="$emit('refresh')"
      >
        <v-icon>fal fa-sync {{isFindPending ? 'fa-spin' : ''}}</v-icon>
      </v-btn>
      <span>Refresh</span>
    </v-tooltip>
  </v-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  props: {
    training: {
      type: Object,
      default: () => ({ steps: [] }),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      del: false,
      delErr: '',
      types: [
        { text: 'Workspace', value: 'workspace' },
        { text: 'Task/Process', value: 'task' },
        { text: 'Tool/Equipment', value: 'tool' },
      ],
    };
  },
  computed: {
    ...mapState('trainings', ['isFindPending']),
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.trainings.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
    stat() { return this.writePerm && typeof this.$route.query.stats !== 'undefined'; },
  },
  methods: {
    async deleteBind() {
      this.delErr = '';
      try {
        await this.binder.remove();
        this.del = false;
      } catch (err) {
        console.error(err);
        this.delErr = 'An unexpected error occured, please contact an administrator.';
      }
    },
  },
};
</script>
