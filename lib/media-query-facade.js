var isString = require('lodash.isstring');
var isObject = require('lodash.isobject');
var merge = require('lodash.merge');
var omitBy = require('lodash.omitby');
var each = require('lodash.foreach');
var some = require('lodash.some');
var bind = require('lodash.bind');

var MQFacade = module.exports = function MQFacade(aliases) {
  this.aliases = aliases || {};
  this.queries = {};
};

MQFacade.prototype.registerAlias = function(alias, query){
  if (isString(alias)) return this.aliases[alias] = query;
  if (isObject(alias)) merge(this.aliases, alias);
};

MQFacade.prototype.on = function(query, callback, context){
  var queryObject;
  try {
    queryObject = this._getQueryObject(query);
  } catch(e) {
    queryObject = this._createQueryObject(query);
  }
  var handler = { callback: callback, context: context || this };
  queryObject.handlers.push(handler);
  if (queryObject.isActive) this._triggerHandler(handler);
};

MQFacade.prototype.off = function(query, callback, context){
  if (!arguments.length) return each(this.queries, bind(this._removeQueryObject, this), this);
  if (!callback && !context) return this._removeQueryObject(query);
  this._removeHandler(query, callback, context);
};

MQFacade.prototype._removeAlias = function(query){
  this.aliases = omitBy(this.aliases, function(value){
    return value === query;
  });
};

MQFacade.prototype._removeQueryObject = function(value, query){
  if (isString(value)) query = value;
  query = this.aliases[query] || query;
  var queryObject = this._getQueryObject(query);
  queryObject.mql.removeListener(queryObject.listener);
  delete this.queries[query];
  this._removeAlias(query);
};

MQFacade.prototype._removeHandler = function(query, callback, context){
  var queryObject = this._getQueryObject(query);
  var handlers = queryObject.handlers;
  some(handlers, function(handler, i){
    var match = handler.callback === callback ? true : false;
    if (context) match = handler.context === context ? true : false;
    if (match) return handlers.splice(i, 1);
  });
  if (!handlers.length) this._removeQueryObject(query);
};

MQFacade.prototype._createQueryObject = function(query){
  query = this.aliases[query] || query;
  var queryObject = { handlers: [] };
  var mql = queryObject.mql = window.matchMedia(query);
  var listener = queryObject.listener = bind(this._triggerHandlers, this, queryObject);
  queryObject.isActive = mql.matches;
  mql.addListener(listener);
  return this.queries[query] = queryObject;
};

MQFacade.prototype._getQueryObject = function(query){
  var queryObject = this.queries[this.aliases[query] || query];
  if (!queryObject) throw new Error('"' + query + '" is not registered');
  return queryObject;
};

MQFacade.prototype._triggerHandlers = function(queryObject){
  var isActive = queryObject.isActive = !queryObject.isActive;
  if (!isActive) return;
  each(queryObject.handlers, this._triggerHandler);
};

MQFacade.prototype._triggerHandler = function(handler){
  handler.callback.call(handler.context);
};
