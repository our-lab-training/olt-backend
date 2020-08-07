import store from '@/store';
import perms from '../perms';

export default {
  ref: 'training',
  name: 'Training',
  requires: ['safety-binder'],
  // settingsLink: '/group/{groupId}/training/settings',
  routes: {
    training: {
      name: 'Training',
      entry: true,
      component: () => import('./training.vue'),
      path: '/org/{groupId}/training/:bindId?',
      icon: 'fal fa-graduation-cap',
      priority: 110,
      visiblePerms: [
        '{groupId}.trainings.read',
      ],
    },
    inductions: {
      name: 'Inductions',
      entry: true,
      component: () => import('./inductions.vue'),
      path: '/org/{groupId}/inductions/:inductId?',
      icon: 'fal fa-clipboard-list-check',
      priority: 110,
      visiblePerms: [
        '{groupId}.inductions.read',
      ],
    },
  },
  store: {
    trainings: {
      instanceDefaults: {
        name: '',
        steps: [],
        published: null,
      },
    },
    inductions: {
      instanceDefaults: {
        name: '',
        bookingDesc: 'Below are a list of inductors, please contact one of them to arrange an induction.',
        list: [],
        published: null,
      },
    },
    'completed-inductions': {
      instanceDefaults: {
        list: [],
        userIds: [],
      },
    },
  },
  perms: (groupId) => {
    const inductions = store.getters['inductions/find']({ query: { groupId } }).data;
    const trainings = store.getters['trainings/find']({ query: { groupId } }).data;
    return [
      ...perms(groupId),
      ...inductions.map(ind => ({
        text: `Inductions - Induct ${ind.name}`,
        value: `inductions.${ind._id}.inductor`,
      })),
      ...inductions.map(ind => ({
        text: `Inductions - Completed ${ind.name}`,
        value: `inductions.${ind._id}.complete`,
        readonly: true,
      })),
      ...trainings.map(train => ({
        text: `Training - Completed ${train.name}`,
        value: `trainings.${train._id}.complete`,
        readonly: true,
      })),
      ...trainings.reduce((a, train) => [...a, ...train.steps.reduce((b, step) => {
        if (!step.required) return b;
        if (
          step.type === 'comment-link'
          || (
            step.type === 'doc'
            && step.docType === 'content'
          )
        ) {
          b.push({
            text: `Training - Accepted ${step.name} From ${train.name}`,
            value: `trainings.${step._id}.accept`,
            readonly: true,
          });
        }
        return b;
      }, [])], []),
    ];
  },
};
