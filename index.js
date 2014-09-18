'use strict';

var utils = require('./pouch-utils');
var dataquery = require("dataquery");

exports.dataquery = utils.toPromise(function (query, callback) {
  var self = this;
  var searchPouchIndex = function (db, index) {
    return function (search, callback) {
      var view = index + "/" + index;
      var endkey = search.map(function (el) {
        if (el === null) {
          return {};
        }
        return el;
      });
      db.query(view, {
        startkey: search,
        endkey: endkey
      }).then(function (data) {
        callback(data.rows.map(function (el) {
          return el.value;
        }));
      });
    };
  };

  var initPouchDB = function () {
    return dataquery.db(self, searchPouchIndex(self, "eav"), searchPouchIndex(self, "ave"));
  };

  dataquery.q(query, function (data) {
    callback(null, data);
  }, initPouchDB());
});

/* istanbul ignore next */
if (typeof window !== 'undefined' && window.PouchDB) {
  window.PouchDB.plugin(exports);
}