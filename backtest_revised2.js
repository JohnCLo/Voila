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

// function init(end_date, range, reg_periods){
//   for (var i = 0; i < tickers.length; i++) {

//   };

//   // for (var i = 0; i < range; i++) {
//   //   var ending_date = moment(end_date, "YYYY-MM-DD").subtract(i, 'weeks').format('YYYY-MM-DD')

//   //   getDates(ending_date, 2)
//   //   getDates(ending_date, 6)
//   //   getDates(ending_date, 12)
//   // };
// }


////// data collection ///////////////// experimental /////////////////
// calculate the differences (days) for each reg_period
var reg_periods = [12,6,2];
var ticker = 'A';
var end_date = '2015-07-13';
var ending_date = '2015-07-13';
var range = 2;

timer(1000);

function timer (iterations){
  var part1 = [];
  var part2 = [];
  var part3 = [];
  var total = [];
  for (var i = 0; i < iterations; i++) {
    var start = new Date().getTime();
      var test = setup();
    var start2 = new Date().getTime();
      var test2 = max_loop(test[1], test[2]);
    var start3 = new Date().getTime();
      sub_loops(test[0], test2);
    var start4 = new Date().getTime();
    part1.push(start2-start);
    part2.push(start3-start2);
    part3.push(start4-start3);
    total.push(start4-start);
    console.log(i);
    //console.log(start2-start, start3-start2, start4-start3, start4-start);
  }
  console.log(ss.mean(part1), ss.mean(part2), ss.mean(part3), ss.mean(total));
}

function setup (){

  // var differences = [];
  // for (var i = 0; i < reg_periods.length; i++) {
  //   var starting_date = moment(end_date, "YYYY-MM-DD").subtract(reg_periods[i], 'months').format('YYYY-MM-DD');
  //   var diff = moment(ending_date, 'YYYY-MM-DD').diff(moment(starting_date, 'YYYY-MM-DD'), 'days');
  //   differences.push(diff);
  // };

  // // get actual dates of largest difference
  // console.log(differences);
  // //var max = Math.max(differences); // should be difference[0], if not prompt warning
  // console.log(max);
  // console.log(differences[0])
  // var max = differences[0]
  // if(max != differences[0]){console.log("WARNING: REG PERIODS ARE NOT FORMATTED FROM LARGEST TO SMALLEST")}

  // // since regression needs two values, we need to calculate the max interval in order to pop/push new data
  // // since regression needs data in order from latest to earliest we need to determine the start interval

  // var max_weeks_date = moment(end_date, "YYYY-MM-DD").subtract(range, 'weeks').format('YYYY-MM-DD')
  // var max_interval_date = moment(max_weeks_date, "YYYY-MM-DD").subtract(max, 'days').format('YYYY-MM-DD')
  // var max_interval = moment(end_date, 'YYYY-MM-DD').diff(max_interval_date, 'days');

  // console.log("max interval", max_interval);
  // var start_interval = max_interval - max;
  // console.log("start interval", start_interval);

  // return [differences, max, start_interval];

  var differences = []; 
  for (var i = 0; i < reg_periods.length; i++) {
    differences.push(moment(end_date, 'YYYY-MM-DD').diff(moment(moment(end_date, "YYYY-MM-DD").subtract(reg_periods[i], 'months').format('YYYY-MM-DD'), 'YYYY-MM-DD'), 'days'));
  };
  return [differences, differences[0], moment(end_date, 'YYYY-MM-DD').diff(moment(moment(end_date, "YYYY-MM-DD").subtract(range, 'weeks').format('YYYY-MM-DD'), "YYYY-MM-DD").subtract(differences[0], 'days').format('YYYY-MM-DD'), 'days') - differences[0]];
}

function max_loop (max, start_interval){
  var list = new LinkedList();
  for (var i = max - 1; i >= 0; i--) { // reverse loop since we want most recent entries last

    var date = end_date;
    // if data does not exist for a date, use previous entry <--- how does this ladder effect affect regression?
    if(data[ticker][moment(ending_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD')]){
      list.push([start_interval, data[ticker][moment(ending_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD')]]);
    } else {
      //console.log(moment(ending_date, "YYYY-MM-DD").subtract(i, 'days').format('YYYY-MM-DD'));
      var last_entry = list.last();
      if(last_entry){last_entry = last_entry[1]};
      list.push([start_interval, last_entry]);
    }
    start_interval++;
  }

  // var array = [];
  // for (var i = 0; i < list.length; i++) {array.push(list.get(i))};
  // console.log(array);
  // console.log(array.length)

  return list;
}


function alter_max (list){
  list.pop()
  list.unShift()
}

function sub_loops (differences, list){
  for (var i = 1; i < differences.length; i++) { // ignore first difference, max is already calculated
    var result = subGroup(list, differences[0])
    //regression(result);
    console.log(regression(result));
  };
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
  };
  //console.log(array);
  var list = array;
  var slope = ss.linear_regression().data(list).m();
  var r_squared_func =  ss.linear_regression().data(list).line();
  var r_squared = ss.r_squared(list, r_squared_func);
  return [slope, r_squared];
}


///////////////////////////////////////////////////////////////////////



// actually use smallest interval to calculate regression- how do we add regressions? - but will that affect runtime? should we alter largest interval?





// for (var i = 0; i < diffDays[0]; i++) {
//   var batch;
//   // add to batch, substract form batch
//   // regress batch


//   if (data[tickers[i]][moment(date, "YYYY-MM-DD").subtract(j, 'days').format('YYYY-MM-DD')]){
//     keyDays.push([j, data[tickers[i]][moment(date, "YYYY-MM-DD").subtract(j, 'days').format('YYYY-MM-DD')]]);
//   }
// }



// function getDates(ending_date, months){
//   var starting_date = moment(date, "YYYY-MM-DD").subtract(months, 'months').format('YYYY-MM-DD')
//   var diffDays = moment(ending_date, 'YYYY-MM-DD').diff(moment(starting_date, 'YYYY-MM-DD'), 'days');

//   var list = new LinkedList();
//   list.push();
// }

// // for each ticker, collects data into array and performs regression for each week
// // uses double-linked-list to add and remove from large data set, slow if randomly accessing elements from within the data set
// function collection (date, diffDays){

//   var list = new LinkedList();
//   list.push()
//   // var keyDays = [];
//   // var
//   // for (var j = 0; j < diffDays; j++) {
//   //   // if not a sunday or saturday then;
//   //   if (data[tickers[i]][moment(date, "YYYY-MM-DD").subtract(j, 'days').format('YYYY-MM-DD')]){
//   //     keyDays.push([j, data[tickers[i]][moment(date, "YYYY-MM-DD").subtract(j, 'days').format('YYYY-MM-DD')]]);
//   //   }
//   // }
// }



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






