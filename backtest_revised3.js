var express = require('express');

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , request = require('request')
  , ss = require('simple-statistics')
  , LinkedList = require('double-linked-list')
  , moment = require('moment');

var jf = require('jsonfile');

server.listen(5000);
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

var Quandl = require("quandl");
var quandl = new Quandl();
var options = {
  auth_token: "GCfKzLJiwuSxucYgqHMq"
}
quandl.configure(options);

var data = require('./data/constant/backtest_data_dict_2007-01-01_to_2015-07-13.json');

///////////////////////////////////////////////////////////////////////////
console.log('Collecting Ticker Symbols...')
var tickers = Object.keys(data);
console.log('Ticker Symbols Collected')
///////////////////////////////////////////////////////////////////////////
//console.log(tickers);

// function timer(){
//   var start = new Date().getTime();
  
//   var end_date = '2015-07-13';
//   var range = 100;
//   var reg_periods = [12,6,2] // unit in months, !!!! largest to smallest period
//   init(end_date, range, reg_periods);

//   var stop = new Date().getTime();
//   var elapsed = stop - start;

//   console.log('Total simulation time: '+elapsed+' milliseconds for '+range+' weeks');
//   console.log('Total simulation time: '+elapsed / 1000 +'seconds for '+range+' weeks');
//   console.log('Total simulation time: '+elapsed / 1000 / 60 +'minutes for '+range+' weeks');
// }

// // range (days prior to end_date), unit in weeks, can be altered for days
// // TODO: make it a trading week (Mon-Friday) as opposed to literal week

// // instead of categorizing by date, categorize by stock with the following advantages
// // since we are looking for the top 10 stocks, we can cut the number of stocks into an arbitrary half
// // but that will eliminate u curved data...
// // also by stock also allows for better algorithmic handling of acquiring date data



////// data collection ///////////////// experimental /////////////////
// calculate the differences (days) for each reg_period
var reg_periods = [12,6,2];
var ticker = 'A';
var end_date = '2015-07-13';
var ending_date = '2015-07-13';
var range = 2;

//timer_test(400);

function init(){
  var run = setup();
  var run2 = max_loop(run[1], run[2]);
  var run3 = sub_loops(run[0], run2[0]);

  for (var i = 0; i < iterations; i++) {
    var run = alter_max(test2[0], test2[1], test2[2]);
    var run2 = sub_loops(test[0], run[0]);
  }
}

function showArray (list){
  var array = [];
  for (var i = 0; i < list.length; i++) {array.push(list.get(i))};
  return array;
}

function timer_test (iterations){
  var total_start = new Date().getTime();
  var init = [];
  var part1 = [];
  var part2 = [];
  var total = [];

  var start = new Date().getTime();
    var test = setup();
  var start2 = new Date().getTime();
    var test2 = max_loop(test[1], test[2]);
  var start3 = new Date().getTime();
    sub_loops(test[0], test2[0]);
  var start4 = new Date().getTime();

  //console.log(showArray(test2[0]));

  init.push(start4 - start);

  for (var i = 0; i < iterations; i++) {
    var time = new Date().getTime();
    var run = alter_max(test2[0], test2[1], test2[2]);
    var time2 = new Date().getTime();
    var run2 = sub_loops(test[0], run[0]);
    var time3 = new Date().getTime();

    part1.push(time2-time);
    part2.push(time3-time2);
    total.push(time3-time);
    console.log(i);

    console.log(showArray(run[0]));
  };
  var total_end = new Date().getTime();

  console.log(ss.mean(init), ss.mean(part1), ss.mean(part2), ss.mean(total), 'total:', total_end-total_start);

  // var part1 = [];
  // var part2 = [];
  // var part3 = [];
  // var total = [];
  // for (var i = 0; i < iterations; i++) {
  //   var start = new Date().getTime();
  //     var test = setup();
  //   var start2 = new Date().getTime();
  //     var test2 = max_loop(test[1], test[2]);
  //   var start3 = new Date().getTime();
  //     sub_loops(test[0], test2[0]);
  //   var start4 = new Date().getTime();
  //   part1.push(start2-start);
  //   part2.push(start3-start2);
  //   part3.push(start4-start3);
  //   total.push(start4-start);
  //   console.log(i);
  //   //console.log(start2-start, start3-start2, start4-start3, start4-start);
  // }
  // console.log(ss.mean(part1), ss.mean(part2), ss.mean(part3), ss.mean(total));
}

function setup (){
  var differences = []; 
  for (var i = 0; i < reg_periods.length; i++) {
    differences.push(moment(end_date, 'YYYY-MM-DD').diff(moment(moment(end_date, "YYYY-MM-DD").subtract(reg_periods[i], 'months').format('YYYY-MM-DD'), 'YYYY-MM-DD'), 'days'));
  };
  return [differences, differences[0], moment(end_date, 'YYYY-MM-DD').diff(moment(moment(end_date, "YYYY-MM-DD").subtract(range, 'weeks').format('YYYY-MM-DD'), "YYYY-MM-DD").subtract(differences[0], 'days').format('YYYY-MM-DD'), 'days') - differences[0]];
}

function max_loop (max, start_interval){
  var start_position = start_interval;
  var list = new LinkedList();
  for (var i = max; i >= 0; i--) { // reverse loop since we want most recent entries last, max-1 or max?

    var date = end_date;
    var moment_date = moment(ending_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD');
    // if data does not exist for a date, use previous entry <--- how does this ladder effect affect regression?
    if(data[ticker][moment_date]){
      list.push([start_interval, data[ticker][moment_date]]);
    } else {
      //console.log(moment(ending_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD'));
      var last_entry = list.last();
      if(last_entry){last_entry = last_entry[1]};
      list.push([start_interval, last_entry]);
    }
    start_interval++;
  }
  return [list, moment(ending_date, "YYYY-MM-DD").subtract(max, 'days').format('YYYY-MM-DD'), start_position];
}

function findNext(moment_date){
  var backDate = moment(moment_date, "YYYY-MM-DD").subtract(1, 'days').format('YYYY-MM-DD');
  console.log(moment_date, data[ticker][backDate]);
  if(data[ticker][backDate]){
    return data[ticker][backDate]
  } else {
    return findNext(backDate);
  }
}


function alter_max (list, start_date, start_interval){
  for (var i = 1; i < 8; i++) { // start subtract 1 day, up to 7 days
    list.pop();
    var moment_date = moment(start_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD');
    // if data does not exist for a date, use previous entry <--- how does this ladder effect affect regression?
    if(data[ticker][moment_date]){
      list.unShift([start_interval, data[ticker][moment_date]]);
    } else {
      //console.log(moment_date, start_interval, i, findNext(moment_date));
      //console.log(data[ticker][moment(start_date, "YYYY-MM-DD").subtract(9, 'days').format('YYYY-MM-DD')]);
      //console.log('previous', previousData)
      list.unShift([start_interval, findNext(moment_date)])
    }
    //list.unShift([start_interval, data[ticker][moment(start_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD')]]);
    start_interval--;
  }
  return [list, moment(start_date, "YYYY-MM-DD").subtract(7, 'days').format('YYYY-MM-DD'), start_interval];
}

function sub_loops (differences, list){
  for (var i = 1; i < differences.length; i++) { // ignore first difference, max is already calculated
    var result = subGroup(list, differences[0])
    //regression(result);
    console.log(regression(result));
  }
}

function subGroup (list, difference){
  var newList = list;
  for (var i = 0; i < list.length - difference ; i++) {
    newList.shift()
  }
  return newList;
}

function regression (list){
  var array = []
  for (var i = 0; i < list.length; i++) {
    array.push(list.get(i));
  }
  //console.log(array);
  var list = array;
  var slope = ss.linear_regression().data(list).m();
  var r_squared_func =  ss.linear_regression().data(list).line();
  var r_squared = ss.r_squared(list, r_squared_func);
  return [slope, r_squared];
}


////////// Algorithm Implementations //////////////////////////////////////////

// sorting data with quicksort - performance degrades with smaller datasets
function qSort(arr) {
  if (arr.length == 0) {
    return [];
  }
  var left = [];
  var right = [];
  var pivot = arr[0];
  for (var i = 1; i < arr.length; i++) {
    if (arr[i] < pivot) {
    left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return qSort(left).concat(pivot, qSort(right));
}

// var a = [];
// for (var i = 0; i < 10; ++i) {
//  a[i] = Math.floor((Math.random()*100)+1);
// }
// print(a);
// print();
// print(qSort(a));

// binary search algorithm - should be used for data that is already sorted
// takes array and the item (data) to be found
function binSearch(arr, data) {
  var upperBound = arr.length-1;
  var lowerBound = 0;
  while (lowerBound <= upperBound) {
    var mid = Math.floor((upperBound + lowerBound) / 2);
    if (arr[mid] < data) {
    lowerBound = mid + 1;
    } else if (arr[mid] > data) {
    upperBound = mid - 1;
    } else {
      return mid;
    }
  }
  return -1;
}

// var start = new Date().getTime();
// console.log(binSearch("A", tickers));
// var stop = new Date().getTime();
// var elapsed = stop - start;
// console.log('Total simulation time: '+elapsed+' milliseconds');

// Online Hedge Fund
// User
// different investment options:
// pay as you go
// upfront investment






