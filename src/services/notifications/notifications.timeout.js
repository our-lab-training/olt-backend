const _ = require('lodash');
const md = require('markdown-it')();

const footer = `
<br><br>
<small class="foot">
  This is an automated message from <a href="https://myacc.es">Access</a>. Please do not reply.
</small>
`;
const header = `
<head>
<link href="https://fonts.googleapis.com/css?family=Roboto:100:300,400,500,700,900" rel="stylesheet">
<style>
html {
  font-family: Arial,sans-serif,‘Open Sans’;
  font-family: Roboto,sans-serif;
}
table,
table > * > * > th,
table > * > * > td {
  border: 1px solid lightgray;
  padding: 0.5em;
}
table {
  border-collapse: collapse;
  padding: 0;
}
.foot {
  color: grey;
}
</style>
</head>
`;

module.exports = (app) => {
  const sendNotification = async (users, template, compiledText) => {
    const [user] = users;
    const email = {
      from: app.get('notifyFrom'),
      to: template.sendToUsers
        ? `${template.to ? `${template.to}, ` : ''}${users.map(u => u.email).join(', ')}`
        : template.to,
      subject: template.subject,
      cc: template.cc,
      bcc: template.bcc,
      html: header + md.render(compiledText({
        user: {
          name: user.name,
          firstname: user.profile.firstname,
          lastname: user.profile.lastname,
          username: user.username,
          pheme: user.username,
        },
        users: {
          nameList: users.map(u => u.name).join(', '),
          firstnameList: users.map(u => u.profile.firstname).join(', '),
          lastnameList: users.map(u => u.profile.lastname).join(', '),
          usernameList: users.map(u => u.username).join(', '),
          phemeList: users.map(u => u.username).join(', '),
          table: `| Name | Pheme Number |\n| --- | ---:|\n${
            users.map(u => `| ${u.profile.firstname} ${u.profile.lastname} | ${u.username} |\n`).join('')
          }`,
        },
      })) + footer,
    };
    const result = await app.service('notifme').create({ email });
    // eslint-disable-next-line no-console
    if (result.errors) console.error(result.errors);
    return result.status === 'success';
  };

  const checkNotes = async () => {
    // do this first so any errors wont break the loop.
    // send at a random minute during the next hour
    const nextCheck = new Date(Date.now() + 60 * 60 * 1000);
    nextCheck.setMinutes(Math.ceil(Math.random() * 59));
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') console.log(`checking notifications, next check at ${nextCheck.getHours()}:${nextCheck.getMinutes()}`);
    setTimeout(checkNotes, nextCheck.getTime() - Date.now());

    const notes = await app.service('notifications').find({query: { sent: false, sendOn: { $lte: new Date() } }, paginate: false });
    await Promise.all(notes.map(async (note) => {
      const template = await app.service('notify-templates').get(note.ntId);
      _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
      const compiledText = _.template(template.text);
      const users = await app.service('users').find({ query: { _id: { $in: note.userIds } }, paginate: false });
      const  sent = template.groupUsers
        ? await sendNotification(users, template, compiledText)
        : (await Promise.all(users.map(user => sendNotification([user], template, compiledText)))).indexOf(false) === -1;
      await app.service('notifications').patch(note._id, { sent });
    }));
  };
  setTimeout(checkNotes, 1000);
};