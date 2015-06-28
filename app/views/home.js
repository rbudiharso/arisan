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
  initialize(options) {
    this.entriesView = new EntriesView({collection: options.collection});
  },
  render() {
    var template = require('../templates/home.hbs');
    this.$el.html(template());
    this.drawEntries();
    return this;
  },
  events: {
    'click .draw': 'draw',
    'keyup #entries': 'addEntry',
    'click .remove': 'removeEntry'
  },
  draw() {
    var $result = this.$('.jumbotron');
    drawing(this.entriesView.collection, (err, selected) => {
      var selectedName = selected.get('name');
      var html = `<h1>${selectedName}</h1>`;
      $result.html(html);
    }, (err, selected) => {
      var selectedName = selected.get('name');
      var html = `<h3>FINAL RESULT</h3><h1>${selectedName}</h1>`;
      $result.html(html);
    });
  },
  addEntry(evt) {
    if (evt.keyCode === 13) {
      var input = evt.target;
      this.entriesView.collection.add({name: input.value.trim()});
      this.drawEntries();
      input.value = '';
      input.focus();
    }
    return false;
  },
  removeEntry(evt) {
    var name = evt.target.dataset.entryName;
    var model = this.entriesView.collection.findWhere({name: name});
    this.entriesView.collection.remove(model);
    this.drawEntries();
  },
  drawEntries() {
    this.$('.entries').html(this.entriesView.render().$el.html());
  }
});

module.exports = HomeView;
