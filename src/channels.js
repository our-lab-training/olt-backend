module.exports = function(app) {
  if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return;
  }

  const joinChannels = (connection) => {
    const user = connection.user;
    // add to own userId channel
    app.channel(`userIds/${user._id}`).join(connection);
    app.channel('groups/public').join(connection);
    // add to associated groups
    if(!user.perms) return;
    for(let groupId of user.perms.groups) {
      app.channel(`groupIds/${groupId}`).join(connection);
    }
  };

  const leaveChannels = user => {
    app.channel(app.channels).leave(connection => {
      return user._id === connection.user._id;
    });
  };

  const updateChannels = user => {
    // Find all connections for this user
    const { connections } = app.channel(app.channels).filter(connection =>
      connection.user && connection.user._id === user._id
    );
  
    // Leave all channels
    leaveChannels(user);
  
    // Re-join all channels with the updated user information
    connections.forEach(connection => joinChannels(user, connection));
  };

  app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
    app.channel('anonymous').join(connection);
  });

  app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
    if(connection) {
      // Obtain the logged in user from the connection
      // const user = connection.user;
      
      // The connection is no longer anonymous, remove it
      app.channel('anonymous').leave(connection);

      // Add it to the authenticated user channel
      app.channel('authenticated').join(connection);

      // Channels can be named anything and joined on any condition 
      
      // E.g. to send real-time events only to admins use
      // if(user.isAdmin) { app.channel('admins').join(connection); }

      // If the user has joined e.g. chat rooms
      // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(channel));
      
      // Easily organize users by email and userid for things like messaging
      // app.channel(`emails/${user.email}`).join(channel);
      joinChannels(connection);
    }
  });

  // eslint-disable-next-line no-unused-vars
  // app.publish((data, hook) => {
  // Here you can add event publishers to channels set up in `channels.js`
  // To publish only for a specific event use `app.publish(eventname, () => {})`

  // console.log('Publishing all events to all authenticated users. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.'); // eslint-disable-line

  // e.g. to publish all service events to all authenticated users use
  // return app.channel('authenticated');
  // });

  // Here you can also add service specific event publishers
  // e.g. the publish the `users` service `created` event to the `admins` channel
  // app.service('users').publish('created', () => app.channel('admins'));
  
  // With the userid and email organization from above you can easily select involved users
  // app.service('messages').publish(() => {
  //   return [
  //     app.channel(`userIds/${data.createdBy}`),
  //     app.channel(`emails/${data.recipientEmail}`)
  //   ];
  // });
  app.service('users').publish('updated', data => {
    updateChannels(data);
    return [
      app.channel(`userIds/${data._id}`),
      ...data.perms.groups.map(groupId => app.channel(`groupIds/${groupId}`))
    ];
  });
  app.service('users').publish('patched', data => {
    updateChannels(data);
    return [
      app.channel(`userIds/${data._id}`),
      ...data.perms.groups.map(groupId => app.channel(`groupIds/${groupId}`))
    ];
  });
  app.service('users').on('removed', leaveChannels);

  app.service('groups').publish(data => {
    if(['public', 'global'].indexOf(data.type) !== -1) return app.channel('groups/public');
    return app.channel(`groupIds/${data._id}`);
  });
};
