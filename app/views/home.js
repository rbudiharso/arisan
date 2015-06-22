'use strict';

var Backbone = require('backbone');

function drawing(collection, callback, finishCallback) {
  var timeout = 0;
  var selected;

  function run(time) {
    setTimeout(function() {
      if (time < 500) {
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
    return this;
  },
  events: {
    'click .draw': 'draw'
  },
  draw: function() {
    var $result = this.$('.jumbotron h1');
    drawing(this.collection, function(err, selected) {
      $result.html(selected.get('name'));
    }, function(err, selected) {
      $result.before('<h1>FINAL RESULT</h1>');
      $result.html(selected.get('name'));
    });
  }
});

module.exports = HomeView;
