module.exports = groupId => [
  { text: 'Content - View Visible', value: `${groupId}.content.read`, defaultRoles: ['user', 'moderator', 'admin'] },
  { text: 'Content - View Hidden', value: `${groupId}.content.read-hidden`, defaultRoles: ['moderator', 'admin'] },
  { text: 'Content - Edit All', value: `${groupId}.content.write`, defaultRoles: ['moderator', 'admin'] },
];
