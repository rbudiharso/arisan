'use strict';

var Backbone = require('backbone');

var EntriesView = Backbone.View.extend({
  el: 'ul',
  render: function() {
    var template = require('../templates/entries.hbs');
    this.$el.html(template({entries: this.collection.models}));
    return this;
  }
});

module.exports = EntriesView;
