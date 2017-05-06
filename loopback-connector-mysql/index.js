'use strict';

var DataSource = require('loopback-datasource-juggler').DataSource;
var config = require('../config.json');
var connector = require('loopback-connector-mysql');
var Benchmark = require('benchmark');

var host = process.env.LB_HOST || config.database.host;
var port = process.env.LB_PORT || config.database.port;
var database = process.env.LB_DB || config.database.database;
var username = process.env.LB_USER || config.database.username;
var password = process.env.LB_PASS || config.database.password;

var ds = new DataSource(connector, {
  host: host,
  port: port,
  database: database,
  username: username,
  password: password,
});

var Todo = ds.define('Todo', {
  content: { type: String }
});

var suite = new Benchmark.Suite;
var uniqVal = 0;

function resetTestState() {
  uniqVal = 0;
  Todo.destroyAll();
}

suite
  .add('create', {
    defer: true,
    fn: function (deferred) {
      Todo.create({ content: 'Buy eggs, ' + (uniqVal++) }, function (e) {
        if (e) {
          process.exit(1);
        }
        deferred.resolve();
      });
    },
    onComplete: resetTestState
  })
  .on('cycle', function (event) {
    console.log('- ' + String(event.target));
  })
  .on('complete', function () {
    Todo.destroyAll();
    process.exit();
  })
  .run({ async: true });
