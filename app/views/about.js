'use strict';

var Backbone = require('backbone');

var AboutView = Backbone.View.extend({
  render() {
    var template = require('../templates/about.hbs');
    this.$el.html(template());
  }
});

module.exports = AboutView;
