'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
var Entry = require('../models/entry');

var Entries = Backbone.Collection.extend({
  model: Entry,
  draw() {
    return _.sample(this.models);
  }
});

module.exports = Entries;
