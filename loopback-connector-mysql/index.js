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
      Todo.create({
        content: 'Buy eggs, ' + (uniqVal++)
      }, function (e) {
        if (e) {
          console.log(e);
          process.exit(1);
        }
        deferred.resolve();
      });
    },
    onComplete: resetTestState
  })
  .add('find', {
    defer: true,
    fn: function (deferred) {
      Todo.find(function (e) {
        if (e) {
          console.log(e);
          process.exit(1);
        }
        deferred.resolve();
      });
    },
    onStart: function () {
      Todo.create([
        { content: 'Buy eggs' },
        { content: 'Buy milk' },
        { content: 'Buy cheese' }
      ]);
    },
    onComplete: resetTestState
  })
  .add('find with a simple filter', {
    defer: true,
    fn: function (deferred) {
      Todo.find({ where: { content: 'Buy milk' } }, function (e) {
        if (e) {
          console.log(e);
          process.exit(1);
        }
        deferred.resolve();
      });
    },
    onStart: function () {
      Todo.create([
        { content: 'Buy eggs' },
        { content: 'Buy milk' },
        { content: 'Buy cheese' }
      ]);
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
