'use strict';

var Backbone = require('backbone');
var AppView = require('./views/app');
var Entries = require('./collections/entries');

var Router = Backbone.Router.extend({
  initialize() {
    this.appView = (function() {
      return new AppView().render();
    })();
  },

  routes: {
    '': 'home',
    'about': 'about'
  },

  home() {
    var el = this.appView.$('#center');
    var View = require('./views/home');
    new View({
      el: el,
      collection: new Entries([
        {name: 'Foo'},
        {name: 'Bar'},
        {name: 'Baz'},
      ])
    }).render();
  },

  about() {
    var el = this.appView.$('#center');
    var View = require('./views/about');
    new View({
      el: el,
    }).render();
  }
});

module.exports = Router;
