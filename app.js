/**
 * Module dependencies.
 */

var express = require('express')
  , cs = require('coffee-script')
  , less = require('less')
  , mongoose = require('mongoose')
  , simplesmtp = require('simplesmtp')
  , mailparser = require('mailparser')
  , models = require('./models')
  , routes = require('./routes');

var app = module.exports = express.createServer();
var smtp = simplesmtp.createServer({debug: true, validateSender: false, validateRecipients: false, secureConnection: false, requireAuthentication: true});
var db = mongoose.connect('mongodb://localhost/mockmtp');
var MailParser = mailparser.MailParser;
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});
//smtp configuration

smtp.listen(1025,function(){
  console.log("SMTP Server started on port 1025");
});
smtp.on("startData", function(envelope){
    console.log("Message from:", envelope.from);
    console.log("Message to:", envelope.to);
    envelope.model = new models.Message();
    envelope.mailparser = new MailParser()
    envelope.model.raw = ""
});

smtp.on("data", function(envelope, chunk){
    envelope.mailparser.write(chunk);
    envelope.model.raw += chunk;
});

smtp.on("dataReady", function(envelope, callback){
    envelope.mailparser.on("end",function(mail_object){
      console.log(mail_object);
      envelope.model.from = mail_object.from;
      envelope.model.to = mail_object.to;
      envelope.model.html= mail_object.html;
      envelope.model.text= mail_object.text;
      envelope.model.inbox_id = envelope.inbox_id;
      envelope.model.save();
    });
  envelope.mailparser.end();
  callback(null,envelope.model._id);
});

smtp.on("authorizeUser", function(envelope, userName, password, callback){
  models.Inbox.find({name:userName,code: password}, function(err,docs){
    if(docs.length > 0){
      console.log("I have found the doc")
      envelope.inbox_id = docs[0]._id;
      callback(null,true);
    }
    else{
      callback(true,null);
    }
  });
});

// Routes

app.get('/', routes.index);

//app.listen(3000, function(){
  //console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
//});

