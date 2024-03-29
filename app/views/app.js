'use strict';

var Backbone = require('backbone');

var AppView = Backbone.View.extend({
  el: '#main',
  render() {
    this.$el.html(require('../templates/app.hbs')());
    return this;
  }
});

module.exports = AppView;
