const dotenv = require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();

app.disable('x-powered-by');

app.use(function (req, res, next) {
  res.set('X-Powered-By', 'Astroworld and coffee');
  next();
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Origin", "https://ovn.is");
  res.header('Access-Control-Allow-Methods', "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept, x-ovnis-token, key");
  next();
});

app.use(logger('dev'));
app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // return error message
  res.status(err.status || 500).send({success: false, error: err,  message: err.message});
});

module.exports = app;
