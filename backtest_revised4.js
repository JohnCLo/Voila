var express = require('express');
var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , request = require('request')
  , ss = require('simple-statistics')
  , LinkedList = require('double-linked-list')
  , moment = require('moment')
  ,jf = require('jsonfile');

server.listen(5000);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) { res.sendfile(__dirname + '/index.html')});

var Quandl = require("quandl");
var quandl = new Quandl();
var options = { auth_token: "GCfKzLJiwuSxucYgqHMq" }
quandl.configure(options);

var data = require('./data/constant/backtest_data_dict_2007-01-01_to_2015-07-13.json');
var tickers = Object.keys(data);

function timer(functions){
	var times = {};
	var totalStart = new Date().getTime();
	for (var i = 0; i < functions.length; i++) {
		var start = new Date().getTime();
		functions[i];
		var end = new Date().getTime();
		times[i] = end - start;
	};
	var totalEnd = new Date().getTime();
	times['total'] = totalEnd - totalStart;
	return times;
}

function init(){
	var periods = [12,6,2]; // in months
	var endDate = '2015-07-13';
	var range = 2;
	setup(periods, endDate, range);
	for (var i = 0; i < tickers.length; i++) {
	};
	return
}

function setup(periods, endDate, range){
 	var differences = []; 
  	for (var i = 0; i < periods.length; i++) {differences.push(moment(endDate, 'YYYY-MM-DD').diff(moment(moment(endDate, "YYYY-MM-DD").subtract(periods[i], 'months').format('YYYY-MM-DD'), 'YYYY-MM-DD'), 'days'))};
  	var startIndex = moment(endDate, 'YYYY-MM-DD').diff(moment(moment(endDate, "YYYY-MM-DD").subtract(range, 'weeks').format('YYYY-MM-DD'), "YYYY-MM-DD").subtract(differences[0], 'days').format('YYYY-MM-DD'), 'days') - differences[0];
  	return {'differences':differences, 'maxPeriod':differences[0], 'startIndex':startIndex}
}

function collect(ticker, maxPeriod, endDate, startIndex){
  var list = new LinkedList();
  var startDate = moment(ending_date, "YYYY-MM-DD").subtract(maxPeriod, 'days').format('YYYY-MM-DD');
	for (var i = 1; i < maxPeriod; i++) { // maxPeriod + 1?
		var date = moment(endDate, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD');
		if(data[ticker][date]){list.unShift([start_interval, data[ticker][date]])} 
		else {list.unShift([start_interval, findNext(date)])}
		startIndex--;
	}
	return {'list':list, 'startIndex':startIndex, 'startDate':startDate};
}

function shift(list, startIndex, startDate){
	for (var i = 1; i < 8; i++) { // start subtract 1 day, up to 7 days
    list.pop();
    var date = moment(startDate, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD');
    if(data[ticker][date]){list.unShift([start_interval, data[ticker][date]])} 
    else {list.unShift([start_interval, findNext(date)])}
    startIndex--;
  }
  var startDate = moment(startDate, "YYYY-MM-DD").subtract(7, 'days').format('YYYY-MM-DD')
  return {'list':list, 'startIndex':startIndex, 'startDate':startDate};
}

function findNext(date){
  var backDate = moment(date, "YYYY-MM-DD").subtract(1, 'days').format('YYYY-MM-DD');
  console.log(date, data[ticker][backDate]);
  if(data[ticker][backDate]){
    return data[ticker][backDate]
  } else {
    return findNext(backDate);
  }
}

function batch(differences, list){
	var periodResults = [];
  for (var i = 0; i < differences.length; i++) {
    var newList = list;
		for (var j = 0; j < list.length - differences[i] ; j++) {
		  newList.shift()
		}
		var result = regression(newList);
		periodResults.push(result.slope * result.r2);
  }
  return {'periodResults': periodResults}
}

function regression(list){
  var regression = linear_regression(list); // ported linear regression function for double linked lists
  var slope = regression.m
  var r2 = rSquared(list, linearRegressionLine(regression))
  return {'slope':slope, 'r2':r2};
}

function linearRegression(data) {
  var m, b;
  var dataLength = data.length;
  if (dataLength === 1) {
      m = 0;
      b = data.get(0)[1];
      //b = data[0][1];
  } else {
      var sumX = 0, sumY = 0,
          sumXX = 0, sumXY = 0;
      var point, x, y;
      for (var i = 0; i < dataLength; i++) {
          point = data.get(i)
          //point = data[i];
          x = point[0];
          y = point[1];
          sumX += x;
          sumY += y;
          sumXX += x * x;
          sumXY += x * y;
      }
      // `m` is the slope of the regression line
      m = ((dataLength * sumXY) - (sumX * sumY)) / ((dataLength * sumXX) - (sumX * sumX));
      // `b` is the y-intercept of the line.
      b = (sumY / dataLength) - ((m * sumX) / dataLength);
  }
  // Return both values as an object.
  return {
      m: m,
      b: b
  }
}

function linearRegressionLine(mb) {
  return function(x) {return mb.b + (mb.m * x)};	
}

function rSquared(data, func) {
	var dataLength = data.length
  if (dataLength < 2) { return 1; }
  var sum = 0, average;
  for (var i = 0; i < dataLength; i++) {sum += data.get(i)[1]}
  average = sum / dataLength;
  var sumOfSquares = 0;
  for (var j = 0; j < dataLength; j++) {sumOfSquares += Math.pow(average - data.get(j)[1], 2)}
  var err = 0;
  for (var k = 0; k < dataLength; k++) {err += Math.pow(data.get(k)[1] - func(data.get(k)[0]), 2)}
  return 1 - (err / sumOfSquares);
}


