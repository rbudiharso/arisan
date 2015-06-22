/**
 *  draw
 *  (c) Rahmat Budiharso <rbudiharso@gmail.com>
 */

'use strict';

var Backbone = require('backbone');
var AppRouter = require('../router');

new AppRouter();
Backbone.history.start({pushState: true});
