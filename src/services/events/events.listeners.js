const findDay = (date, days) => {
  date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
  if (!days.length || days.indexOf(date.getDay()) !== -1) return date;
  else return findDay(date, days);
};

module.exports = (app) => process.nextTick(() => {
  const triggerPermEvent = async (perm, context) => {
    if (perm.type !== 'user') return;
    let {method} = context;
    const events = await app.service('events').find({
      query: {
        matches: {
          $elemMatch: {
            eventType: `perm-${method}`,
            ...perm.perm.reduce((a, node, i) => {
              a[`matchPerm.${i}`] = node;
              return a;
            }, {}),
          },
        },
      },
      paginate: false,
    });
    await Promise.all(events.map( async (event) => {
      await Promise.all(event.actions.map(async (action) => {
        let note, template, sendOn, delperm;
        switch (action.actionType) {
        case 'notify':
          note = await app.service('notifications').find({ query: { ntId: action.ntId, sent: false }, paginate: false })[0];
          if(note && note.userIds.indexOf(perm.grantee)) {
            await app.service('notifications').patch(note._id, {userIds: [...note.userIds, perm.grantee]});
          } else if(!note) {
            template = await app.service('notify-templates').get(action.ntId);
            if (!template) return;
            sendOn = new Date();
            if (template.sendOn === 'weekly') {
              sendOn.setMilliseconds(0);
              sendOn.setSeconds(0);
              sendOn.setMinutes(0);
              sendOn.setHours(template.sendOnHour);
              sendOn = findDay(sendOn, template.sendOnDay);
            }
            await app.service('notifications').create( { userIds: [perm.grantee], ntId: action.ntId, sendOn });
          }
          break;
        case 'perm-create':
          await app.service('perms').create({
            type: 'users',
            grantee: perm.grantee,
            perm: action.perm,
          });
          break;
        case 'perm-remove':
          delperm = await app.service('perms').find({
            query: {
              grantee: perm.grantee,
              ...action.perm.reduce((a, node, i) => {
                a[`perm.${i}`] = node;
                return a;
              }, {}),
              enabled: true,
            },
            paginate: false,
          })[0];
          if (delperm) await app.service('perms').remove(delperm._id);
          break;
        default:
          return;
        }
      }));
    }));
  };
  app.service('perms').on('created', triggerPermEvent);
  app.service('perms').on('removed', triggerPermEvent);
});