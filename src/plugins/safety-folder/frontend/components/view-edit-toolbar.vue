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
      {{id === 'new' ? 'New Document Set' : binder.name}}
    </v-toolbar-title>
    <div v-if="id !== 'new'" style="margin-left:0.5em;">
      <small>
        ({{(types.binds.find(t => t.value === binder.type) || {}).text}})
      </small>
    </div>
    <v-spacer />
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
    <v-tooltip v-if="edit" top>
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
    <v-tooltip v-if="writePerm && id !== 'new'" top>
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
    <v-dialog v-model="del" persistent max-width="290">
      <v-card>
        <v-card-title class="headline">Are You Sure?</v-card-title>
        <v-card-text v-if="delErr" class="text--error" v-text="delErr" />
        <v-card-text>Delete {{binder.name}} forever?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="del = false">Cancel</v-btn>
          <v-btn color="error" flat @click.native="deleteBind">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-toolbar>
</template>

<script>
import { mapGetters } from 'vuex';
import types from '../../types';

export default {
  props: {
    binder: {
      type: Object,
      default: () => ({ items: [] }),
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
      types,
    };
  },
  computed: {
    ...mapGetters('users', { hasPerm: 'hasPerm', currentUser: 'current' }),
    ...mapGetters('groups', { currentGroup: 'current' }),
    id() { return this.$route.params.bindId; },
    writePerm() { return this.hasPerm(`${this.currentGroup._id}.binders.write`); },
    edit() { return this.writePerm && (typeof this.$route.query.edit !== 'undefined' || this.id === 'new'); },
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
