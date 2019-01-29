var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var session = require('express-session');
var fs = require('fs');
var mysql = require('mysql');
var http = require('http');
var util = require('util');
var digester = require("xml-digester").XmlDigester({});
var busboy = require('connect-busboy');
require('date-utils');
var db_config = JSON.parse(fs.readFileSync(__dirname + '/config/db-config.json','utf-8'));
var db_query;
app.use(busboy());
app.use(express.static(__dirname + '/public'));
app.set('views',__dirname + '/public');
app.set('view engine','ejs');
app.engine('html', require('ejs').renderFile);
    
//mysql 관련 소스
// lee youngwoo

var connection = mysql.createConnection({
    host    :db_config.host,
    port : db_config.port,
    user : db_config.user,
    password : db_config.password,
    database: db_config.database
});

connection.connect(function(err) {
    if (err) {
        console.error('mysql connection error');
        console.error(err);
        throw err;
    }
});

fs.readFile(__dirname + '/query/query.xml','utf-8',function(err,data){
 if(err){
  console.log(err)
 } else {
  digester.digest(data, function(err,result){
   if(err){
    console.log(err);
   } else {
    db_query = result;
    var router = require('./router/main')(app, fs, connection,util,db_query);
   }
  });
 }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(session({
  secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true,
 cookie : {
  maxAge : 1000 * 60 * 60
 }
}));

var server = http.createServer(app);
server.listen(80, function(){
  console.log('Express server has started on port 80');
});
