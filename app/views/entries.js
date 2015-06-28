'use strict';

var Backbone = require('backbone');

var EntriesView = Backbone.View.extend({
  render() {
    var template = require('../templates/entries.hbs');
    this.$el.html(template({entries: this.collection.models}));
    return this;
  }
});

module.exports = EntriesView;
