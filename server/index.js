var express = require('express');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var SMTPServer = {
  port: 465,
  host: 'smtp.gmail.com',
  auth: {
    user: 'akozenko.work@gmail.com',
    pass: 'qwerty654321'
  }
};
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

var transporter = nodemailer.createTransport(
  smtpTransport(SMTPServer)
);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});

app.use('/static', express.static(path.resolve(__dirname, '../src/static')));
app.use(express.static(path.resolve(__dirname, '../public')));
app.use(bodyParser.urlencoded({ extended: true }));

app.get(/.*/, function root(req, res) {
  res.sendFile(path.resolve(__dirname, '/index.html'));
});

app.post('/send', function(req, res) {
  console.log(req.body);

  transporter.sendMail({
    from: 'Royal Flowers <' + SMTPServer.auth.user + '>',
    to: 'akozenko.work@gmail.com',
    subject: 'Заявка с сайта',
    text: req.body.message
  },
  function(error, info) {
    if(error) {
      return console.log(error);
    }
    console.log('Message sent: ', info.response);
  });

  res.send('ok');
});

app.listen(3000);
