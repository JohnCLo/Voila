var express = require('express');

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , request = require('request')
  , ss = require('simple-statistics')
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


var data_range = '2007-01-01_to_2015-07-13';
var data = require('./data/constant/backtest_data_2_'+data_range+'.json');


var stock_dict = {}

for (var i = 0; i < data.length; i++) {
  console.log(data[i]['ticker']);
  var data_dict = {}
  for (var j = 0; j < data[i]['data'].length; j++) {
    data_dict[data[i]['data'][j][0]] = data[i]['data'][j][1];
  };
  stock_dict[data[i]['ticker']] = data_dict;
};

jf.spaces = 1;
var file = 'data/backtest_data_dict_'+data_range+'.json';
jf.writeFile(file, stock_dict, function(err) {
  if(err){console.log(err);}
  console.log("conversion to dictionary completed");
})

