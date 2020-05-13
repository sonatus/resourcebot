var async = require('async');

module.exports = function(app) {
  app.command('status( resource)? ([A-Za-z0-9\-]+) ([A-Za-z0-9\s]+)$', function(bot, message) {
    var resourceName = message.match[2];
    var newStatus = message.match[3];

    var ResourceDoesNotExistError = function() {};

    var queryForResource = function(cb) {
      app.storage.resources.findOne({
        name: resourceName
      }, cb);
    };

    var errorIfResourceDoesNotExist = function(resource, cb) {
      if (!resource) {
        cb(new ResourceDoesNotExistError());
      } else {
        cb();
      }
    };

    var updateResource = function(cb) {
      app.storage.resources.save(resourceName, {
        status: newStatus 
      }, cb);
    };

    var respondWithSuccessMessage = function(resource, cb) {
      bot.reply(message, 'Okay, I\'ve updated the status for `' + resourceName + '`', cb);
    };

    var onError = function(err) {
      if (err) {
        if (err instanceof ResourceDoesNotExistError) {
          bot.reply(message, 'Sorry, it looks like there\'s no existing resource called `' + resourceName + '`');
        } else {
          console.error('Unexpected error:', err);
          bot.reply(message, 'Unexpected error: ' + err);
        }
      }
    };

    async.waterfall([
      queryForResource,
      errorIfResourceDoesNotExist,
      updateResource,
      respondWithSuccessMessage
    ], onError);
  });
};