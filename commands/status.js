var async = require('async');

module.exports = function(app) {
  app.command('status( resource)? ([A-Za-z0-9\-]+) ([A-Za-z0-9\-\_]+)$', function(bot, message) {
    var resourceName = message.match[2];
    var newStatus = message.match[3];
    var resource;

    function ResourceDoesNotExist() {}

    async.waterfall([
      function(cb) {
        app.storage.resources.findOne({
          name: resourceName
        }, cb);
      },
      function(_resource, cb) {
        resource = _resource;
        cb();
      },
      function(cb) {
        if (!resource) {
          return cb(new ResourceDoesNotExist());
        } 
      
        app.storage.resources.save(resourceName, {
          claim_until: resource.claim_until,
          status: newStatus,
          user: resource.user,
          username: resource.username,
        }, cb);
      },
      function(cb) {
        bot.reply(message, 'Okay, I\'ve updated the status for `' + resourceName + '`');
      }
    ], function(err) {
      if (err && err instanceof ResourceDoesNotExist) {
        bot.reply(message, 'Sorry, it looks like there\'s no existing resource called `' + resourceName + '`');
        return;
      } 
      if (err) {
        console.error('Unexpected error:', err);
        return;
      }   
    });
  });
};
