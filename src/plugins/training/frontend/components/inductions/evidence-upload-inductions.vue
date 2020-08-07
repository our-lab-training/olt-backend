<template>
  <v-card>
    <v-card-title class="headline">
      Upload Evidence of a Previous Induction
    </v-card-title>
    <v-card-text>
      <report-error :error="error"/>
      <v-autocomplete
        :items="findUsers({
          query: { 'perms.groups': currentGroup._id, $limit: 9999, $sort: { text: 1 } },
        }).data"
        item-value="_id"
        v-model="userIds"
        prepend-icon="fal fa-users"
        multiple
        small-chips chips deletable-chips
        label="Inducted Users"
      />
      <v-combobox
        :items="findUsers({
          query: { 'perms.groups': currentGroup._id, $limit: 9999, $sort: { text: 1 } },
        }).data"
        item-value="_id"
        v-model="inductor"
        prepend-icon="fal fa-user"
        label="Inductor"
        small-chips chips deletable-chips
        menu-props="inductorProps"
        persistent-hint hint="
          Select existing user or type the name and hit enter
        "
      />
      <br>
      <v-menu
        v-model="dateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        lazy
        transition="scale-transition"
        offset-y
        full-width
        min-width="290px"
      >
        <template v-slot:activator="{ on }">
          <v-text-field
            v-model="date"
            label="Date Completed"
            prepend-icon="fal fa-calendar-alt"
            readonly
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="date"
          @input="dateMenu = false"
          :max="(new Date()).toISOString().replace(/T.*$/, '')"
        />
      </v-menu>
      <uploadInput
        :valid.sync="validFile"
        :save.sync="saveFile"
        :path="`Inductions/${currentInduction._id}/manual-evidence/`"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer/>
      <v-btn @click="reset(); $emit('update:show', false);" flat>Cancel</v-btn>
      <v-btn
        @click="save()"
        color="success" flat
        :disabled="!valid || loading"
      >Upload</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import uploadInput from '@/plugins/content/frontend/upload-choose-input.vue';
import reportError from '@/views/partials/report-error.vue';
import { mapGetters, mapState } from 'vuex';

export default {
  components: {
    uploadInput,
    reportError,
  },
  data() {
    return {
      saveFile: null,
      validFile: false,
      userIds: [],
      inductor: null,
      date: (new Date()).toISOString().replace(/T.*$/, ''),
      dateMenu: false,
      error: null,
      loading: false,
      inductorProps: {
        closeOnClick: true,
        closeOnContentClick: true,
        openOnClick: true,
        maxHeight: 300,
      },
    };
  },
  computed: {
    ...mapGetters('groups', { currentGroup: 'current' }),
    ...mapGetters('inductions', { currentInduction: 'current' }),
    ...mapGetters('users', { findUsers: 'find' }),
    ...mapState('completed-inductions', ['isCreatePending']),
    valid() { return this.validFile && this.userIds.length && this.inductor && this.date; },
  },
  methods: {
    reset() {
      Object.assign(this, {
        userIds: [],
        inductor: null,
        date: (new Date()).toISOString().replace(/T.*$/, ''),
        error: null,
      });
    },
    async save() {
      if (!this.valid || this.isCreatePending) return;
      this.loading = true;
      this.error = null;
      const { CompletedInduction } = this.$FeathersVuex;
      let comp;
      try {
        comp = new CompletedInduction({
          inductId: this.currentInduction._id,
          userIds: this.userIds,
          inductorName: typeof this.inductor === 'string' ? this.inductor : undefined,
          inductorId: typeof this.inductor !== 'string' ? this.inductor._id : undefined,
          completedAt: new Date(this.date),
          proofId: await this.saveFile(),
          done: true,
        });
        await comp.save();
      } catch (err) {
        this.loading = false;
        console.error(err);
        this.error = err;
        return;
      }
      this.loading = false;
      this.reset();
      this.$emit('update:show', false);
    },
  },
};
</script>
