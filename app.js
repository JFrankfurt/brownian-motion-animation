var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var app = express();

let router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));

router.get('/', function (req, res, next) {
    res.render('index');
});

app.use('/', router);

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
