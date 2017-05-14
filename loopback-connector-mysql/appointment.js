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

var Physician = ds.define('Physician', {
  name: { type: String }
});

var Patient = ds.define('Patient', {
  name: { type: String }
});

var Appointment = ds.define('Appointment', {
  date: {
    type: Date,
    default: function () {
      return new Date;
    }
  },
});

Physician.hasMany(Appointment, {
  as: 'appointment',
  foreignKey: 'physician_id'
});
Appointment.belongsTo(Physician, {
  as: 'physician',
  foreignKey: 'physician_id'
});

Patient.hasMany(Appointment, {
  as: 'appointment',
  foreignKey: 'patient_id'
});
Appointment.belongsTo(Patient, {
  as: 'patient',
  foreignKey: 'patient_id'
});

ds.models.Physician;
ds.models.Appointment;
ds.models.Patient;

var suite = new Benchmark.Suite;

function checkError(e) {
  if (e) {
    console.log(e);
    process.exit(1);
  }
};

function resetTestState() {
  Physician.destroyAll();
}

ds.automigrate(err => {
  checkError(err);

  suite
    .add('create', {
      defer: true,
      fn: function (deferred) {
        Physician.create([
          { name: 'Smith' },
          { name: 'Johnson' },
          { name: 'Williams' },
          { name: 'Jones' },
        ], function (e) {
          checkError(e);
          deferred.resolve();
        });
      },
      onComplete: resetTestState
    })
    .on('cycle', function (event) {
      console.log('- ' + String(event.target));
    })
    .on('complete', function () {
      Appointment.destroyAll();
      Physician.destroyAll();
      Patient.destroyAll();
      process.exit();
    })
    .run({ async: true });
});
