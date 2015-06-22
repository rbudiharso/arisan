'use strict';

var Backbone = require('backbone');
var insignia = require('insignia');

function drawing(collection, callback, finishCallback) {
  var timeout = 0;
  var selected;

  function run(time) {
    setTimeout(function() {
      if (time < 300) {
        selected = collection.draw();
        callback(null, selected);
        run(time+5);
      } else {
        finishCallback(null, selected);
      }
    }, time);
  }

  run(timeout);
}

var HomeView = Backbone.View.extend({
  render: function() {
    var template = require('../templates/home.hbs');
    this.$el.html(template());
    this.insignia = insignia(this.$('#entries')[0], {
      delimiter: ',',
      deletion: true,
    });
    return this;
  },
  events: {
    'click .draw': 'draw'
  },
  draw: function() {
    var entries = this.insignia.tags();
    this.collection.reset(entries.map(function(entry) {
      return {name: entry};
    }));
    var $result = this.$('.jumbotron h1');
    drawing(this.collection, function(err, selected) {
      $result.html(selected.get('name'));
    }, function(err, selected) {
      $result.before('<h3>FINAL RESULT</h3>');
      $result.html(selected.get('name').toUppercase());
    });
  }
});

module.exports = HomeView;
