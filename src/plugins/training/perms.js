module.exports = groupId => [
  { text: 'Training - View', value: `${groupId}.trainings.read`, defaultRoles: ['user', 'moderator', 'admin'] },
  { text: 'Training - Suggest', value: `${groupId}.trainings.suggest`, defaultRoles: ['moderator'] },
  { text: 'Training - Edit (Approve Suggestions)', value: `${groupId}.trainings.write`, defaultRoles: ['admin'] },

  { text: 'Inductions - View', value: `${groupId}.inductions.read`, defaultRoles: ['user', 'moderator', 'admin'] },
  { text: 'Inductions - Suggest', value: `${groupId}.inductions.suggest`, defaultRoles: ['moderator'] },
  { text: 'Inductions - Edit (Approve Suggestions)', value: `${groupId}.inductions.write`, defaultRoles: ['admin'] },
];
