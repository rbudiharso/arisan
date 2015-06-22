'use strict';

var Backbone = require('backbone');
var AppView = require('./views/app');
var Entries = require('./collections/entries');

var entries = new Entries([
  {name: 'rahmat'},
  {name: 'ari'},
  {name: 'bima'},
  {name: 'widi'},
  {name: 'deri'},
  {name: 'windi'},
  {name: 'pak tim'},
]);

var Router = Backbone.Router.extend({
  initialize: function() {
    this.appView = (function() {
      return new AppView().render();
    })();
  },

  routes: {
    '': 'home',
    '/': 'home'
  },

  home: function() {
    var el = this.appView.$('#center');
    var HomeView = require('./views/home');
    var homeView = new HomeView({
      el: el,
      collection: entries
    });
    homeView.render();
  }
});

module.exports = Router;
