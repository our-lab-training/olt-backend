module.exports = groupId => [
  { text: 'Safety Binder - View', value: `${groupId}.binders.read`, defaultRoles: ['user', 'moderator', 'admin'] },
  { text: 'Safety Binder - Suggest', value: `${groupId}.binders.suggest`, defaultRoles: ['moderator'] },
  { text: 'Safety Binder - Edit (Approve Suggestions)', value: `${groupId}.binders.write`, defaultRoles: ['admin'] },
];
