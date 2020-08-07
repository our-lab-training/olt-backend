import perms from '../perms';

export default {
  ref: 'binder',
  name: 'Safety Binder',
  // settingsLink: '/group/{groupId}/training/settings',
  routes: {
    binder: {
      name: 'Safety Binder',
      entry: true,
      component: () => import('./binder.vue'),
      path: '/org/{groupId}/binder/:bindId?',
      icon: 'fal fa-book',
      priority: 109,
      visiblePerms: [
        '{groupId}.binders.read',
      ],
    },
  },
  store: {
    binders: {
      instanceDefaults: {
        name: '',
        type: '',
        desc: '',
        items: [],
      },
    },
  },
  perms,
};
