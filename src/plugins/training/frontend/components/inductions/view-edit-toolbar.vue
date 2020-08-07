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
      {{id === 'new' ? 'New Induction' : induction && induction.name}}
    </v-toolbar-title>
    <v-spacer />
    <v-tooltip v-if="writePerm" top>
      <v-btn
        slot="activator"
        @click.stop="evi = true"
        flat icon
        :disabled="disabled"
      >
        <v-icon>fal fa-file-upload</v-icon>
      </v-btn>
      <span>Upload Previous Induction Evidence</span>
    </v-tooltip>
    <v-tooltip v-if="writePerm" top>
      <v-btn
        slot="activator"
        @click.stop="del = true"
        flat icon
        :disabled="disabled"
      >
        <v-icon>fal fa-trash</v-icon>
      </v-btn>
      <span>Delete</span>
    </v-tooltip>
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
    <!-- <v-tooltip v-if="!edit" top>
      <v-btn
        slot="activator"
        flat icon
        @click.stop="$emit('refresh')"
      >
        <v-icon>fal fa-sync {{isGetPending ? 'fa-spin' : ''}}</v-icon>
      </v-btn>
      <span>Refresh</span>
    </v-tooltip> -->
    <v-dialog v-model="del" persistent max-width="300">
      <v-card>
        <v-card-title class="headline">
          Are you sure you want to delete this induction forever?
        </v-card-title>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.stop="del = false">Cancel</v-btn>
          <v-btn color="error" flat @click.stop="deleteInduct">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="evi" max-width="400" persistent>
      <evidence-upload :show.sync="evi"/>
    </v-dialog>
  </v-toolbar>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import evidenceUpload from './evidence-upload-inductions.vue';

export default {
  components: {
    evidenceUpload,
  },
  props: {
    induction: {
      type: Object,
      default: () => ({ list: [] }),
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
      evi: false,
      delErr: '',
    };
  },
  computed: {
    ...mapState('inductions', ['isGetPending']),
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    id() { return this.$route.params.inductId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.inductions.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
    stat() { return this.writePerm && typeof this.$route.query.stats !== 'undefined'; },
  },
  methods: {
    async deleteInduct() {
      this.delErr = '';
      try {
        await this.induction.remove();
        this.del = false;
      } catch (err) {
        console.error(err);
        this.delErr = 'An unexpected error occured, please contact an administrator.';
      }
    },
  },
};
</script>
