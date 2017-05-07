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

connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    process.exit(1);
  }

  console.log(`connected as id ${connection.threadId}`);

  var suite = new Benchmark.Suite;
  var uniqVal = 0;

  function resetTestState() {
    uniqVal = 0;
    connection.query('truncate Todo', (e, _results, _fields) => {
      if (e) {
        console.log(e);
        process.exit(1);
      }
    });
  }

  function insertTodo(cb) {
    connection.query(
      'INSERT INTO ?? SET ?',
      ['Todo', { content: 'Buy eggs ' + uniqVal++ }],
      function (e, _results) {
        cb(e);
      });
  }

  suite
    .add('create', {
      defer: true,
      fn: function (deferred) {
        insertTodo(e => {
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
        connection.query('SELECT * FROM Todo', (e, _results) => {
          if (e) {
            console.log(e);
            process.exit(1);
          }
          deferred.resolve();
        });
      },
      onStart: function () {
        const contents = [['Buy eggs'], ['Buy milk'], ['Buy cheese']];
        connection.query(
          'INSERT INTO ?? (content) VALUES ?',
          ['Todo', contents],
          function (e, _results) {
            if (e) {
              console.log(e);
              process.exit(1);
            }
          });
      },
      onComplete: resetTestState
    })
    .add('find with simple filter', {
      defer: true,
      fn: function (deferred) {
        connection.query('SELECT * FROM Todo WHERE `content` = "Buy milk"', (e, _results) => {
          if (e) {
            console.log(e);
            process.exit(1);
          }
          deferred.resolve();
        });
      },
      onStart: function () {
        const contents = [['Buy eggs'], ['Buy milk'], ['Buy cheese']];
        connection.query(
          'INSERT INTO ?? (content) VALUES ?',
          ['Todo', contents],
          function (e, _results) {
            if (e) {
              console.log(e);
              process.exit(1);
            }
          });
      },
      onComplete: resetTestState
    })
    .on('cycle', function (event) {
      console.log('- ' + String(event.target));
    })
    .on('complete', function () {
      connection.end();
      process.exit();
    })
    .run({ async: true });
});
