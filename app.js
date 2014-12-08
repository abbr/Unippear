var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
routes.publicFolderNm = 'public-test';
var app = express();

// view engine setup
app.set('views', path.join(__dirname, routes.publicFolderNm));
app.set('view engine', 'ejs');

// trust proxy
app.set('trust proxy', true);

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, routes.publicFolderNm, 'static')));

app.use('/index.js', routes);

app.use(function(req, res, next) {
    require('fs').exists(path.join(__dirname, routes.publicFolderNm, 'static', req.path + '.ejs'), function(exists) {
        if (exists) {
            res.type(path.extname(req.path));
            res.render(path.join('static', req.path + '.ejs'), {
                currHost: req.protocol + "://" + req.host
            });

        }
        else {
            next();
        }
    });
});


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('api/error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('api/error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
