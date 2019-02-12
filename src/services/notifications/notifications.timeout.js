const sendNotification = (users, template) => {};

module.exports = (app) => {
  const checkNotes = async () => {
    // do this first so any errors wont break the loop.
    // send at a random minute during the next hour
    const nextCheck = new Date(Date.now() + 60 * 60 * 1000);
    nextCheck.setMinutes(Math.ceil(Math.random * 59));
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV !== 'production') console.log(`checking notifications, next check at ${nextCheck.getHours()}:${nextCheck.getMinutes()}`);
    setTimeout(checkNotes, nextCheck.getTime() - Date.now());

    const notes = await app.service('notifications').find({query: { sent: false, sendOn: { $lte: new Date() } }, paginate: false });
    await Promise.all(notes.map(async (note) => {
      const template = await app.service('notify-templates').get(note.ntId);
      const users = await app.service('users').find({ query: { _id: { $in: note.userIds } }, paginate: false });
      const  sent = template.groupUsers
        ? await sendNotification(users, template)
        : (await Promise.all(users.map(user => sendNotification([user], template)))).indexOf(false) === -1;
      await app.service('notifications').patch(note._id, { sent });
    }));
  };
};