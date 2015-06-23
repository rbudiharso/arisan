'use strict';

var Backbone = require('backbone');
var EntriesView = require('./entries');

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
  initialize: function(options) {
    this.entriesView = new EntriesView({collection: options.collection});
  },
  render: function() {
    var template = require('../templates/home.hbs');
    this.$el.html(template());
    this.$('.entries').append(this.entriesView.render().html);
    return this;
  },
  events: {
    'click .draw': 'draw',
    'keyup #entries': 'addEntry',
    'click .remove': 'removeEntry'
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
  },
  addEntry: function(evt) {
    if (evt.keyCode === 13) {
      var input = evt.target;
      this.entriesView.collection.add({name: input.value.trim()});
      this.entriesView.render();
      input.value = '';
      input.focus();
      console.log(this.collection.models);
    }
    return false;
  },
  removeEntry: function(evt) {
  }
});

module.exports = HomeView;
