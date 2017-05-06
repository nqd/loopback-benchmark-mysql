'use strict';

var mysql = require('mysql');
var config = require('../config.json');
var Benchmark = require('benchmark');

var host = process.env.LB_HOST || config.database.host;
var port = process.env.LB_PORT || config.database.port;
var database = process.env.LB_DB || config.database.database;
var username = process.env.LB_USER || config.database.username;
var password = process.env.LB_PASS || config.database.password;

var connection = mysql.createConnection({
  host: host,
  port: port,
  user: username,
  database: database,
  password: password,
});

var suite = new Benchmark.Suite;

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    process.exit(1);
  }

  console.log(`connected as id ${connection.threadId}`);
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
    });
});
