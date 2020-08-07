<template>
  <v-list>
    <v-list-tile @click.stop="openDialog('markdown')">
      <v-list-tile-action><v-icon>fal fa-file-invoice</v-icon></v-list-tile-action>
      <v-list-tile-title>New Document</v-list-tile-title>
    </v-list-tile>
    <v-list-tile @click.stop="openDialog('text')">
      <v-list-tile-action><v-icon>fal fa-file-alt</v-icon></v-list-tile-action>
      <v-list-tile-title>New Text File</v-list-tile-title>
    </v-list-tile>
    <v-divider></v-divider>
    <v-list-tile @click.stop="openDialog('directory')">
      <v-list-tile-action><v-icon>fal fa-folder-plus</v-icon></v-list-tile-action>
      <v-list-tile-title>New Folder</v-list-tile-title>
    </v-list-tile>
    <v-divider></v-divider>
    <v-list-tile @click.stop="openDialog('upload')">
      <v-list-tile-action><v-icon>fal fa-cloud-upload</v-icon></v-list-tile-action>
      <v-list-tile-title>Upload File</v-list-tile-title>
    </v-list-tile>
    <v-list-tile @click.stop="openDialog('link')">
      <v-list-tile-action><v-icon>fal fa-external-link</v-icon></v-list-tile-action>
      <v-list-tile-title>External File Link</v-list-tile-title>
    </v-list-tile>
    <new-dialog :dialog.sync="dialog" :type="type" :parent="parent"/>
  </v-list>
</template>

<script>
import newDialog from './dialog.vue';

export default {
  components: {
    newDialog,
  },
  props: {
    parent: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialog: false,
      type: 'text',
    };
  },
  methods: {
    openDialog(type) {
      this.type = type || this.type;
      this.dialog = true;
    },
  },
};
</script>
