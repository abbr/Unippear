var express = require('express');
var router = express.Router();
var recursive = require('recursive-readdir');
var fs = require('fs');
var path = require('path');
var async = require('async');
var ejs = require('ejs');
var etag = require('etag');

// Get combined.js
router.get('*/combined.js', function(req, res) {
    var thisFileUrlPath = req.params[0].replace(/\/$/, '');
    res.type('application/javascript');
    var jsPath = path.join(__dirname, '../', router.publicFolderNm, 'assets', thisFileUrlPath, '/js');
    recursive(path.resolve(jsPath), function(err, files) {
        if (!files) {
            return res.status(404).end();
        }
        async.map(files, fs.readFile, function(err, outputs) {
            if (err) {
                console.error(err);
                res.status(500).end();
                return;
            }
            var cnt = '';
            outputs.forEach(function(output, idx) {
                output = output.toString();
                if (path.extname(files[idx]) === '.ejs') {
                    output = ejs.render(output, {
                        "unippearHost": req.protocol + "://" + req.hostname,
                        "thisFileUrlPath": path.dirname(files[idx]).substring(path.join(__dirname, '../', router.publicFolderNm, 'assets').length)
                    });
                }
                cnt += output + '\n';
            });
            res.setHeader('ETag', etag(cnt));
            if (req.fresh) {
                res.status(304).end();
            }
            else {
                res.end(cnt);
            }
        });
    });
});


/* GET home page. */
router.get(/^(.*)\/(index\.js)?$/, function(req, res) {
    var thisFileUrlPath = req.params[0].replace(/\/$/, '');
    res.type('application/javascript');
    var cssPath = path.join(__dirname, '../', router.publicFolderNm, '/assets', thisFileUrlPath, '/css');
    recursive(cssPath, function(err, files) {
        var cssFiles = (files || []).map(function(v) {
            return req.protocol + "://" + req.hostname + thisFileUrlPath + v.substring(cssPath.length - 4).replace(/\.ejs$/, '');
        });
        if (router.combineJs) {
            res.render('api/index', {
                "unippearHost": req.protocol + "://" + req.hostname,
                "thisFileUrlPath": thisFileUrlPath,
                "cssFiles": cssFiles
            });
            return;
        }
        var jsPath = path.join(__dirname, '../', router.publicFolderNm, '/assets', thisFileUrlPath, '/js/');
        recursive(jsPath, function(err, files) {
            var jsFiles = (files || []).map(function(v) {
                return v.substring(jsPath.length).replace(/\.ejs$/, '');
            });
            res.render('api/index', {
                "unippearHost": req.protocol + "://" + req.hostname,
                "thisFileUrlPath": thisFileUrlPath,
                "jsFiles": jsFiles,
                "cssFiles": cssFiles
            });
        });
    });
});


// Get all ejs assets
router.get('*/*', function(req, res, next) {
    var thisFileUrlPath = req.params[0].replace(/\/$/, '');

    require('fs').exists(path.join(__dirname, '..', router.publicFolderNm, 'assets', req.path + '.ejs'), function(exists) {
        if (exists) {
            res.type(path.extname(req.path));
            res.render(path.join('assets', req.path + '.ejs'), {
                unippearHost: req.protocol + "://" + req.hostname,
                "thisFileUrlPath": thisFileUrlPath
            });
        }
        else {
            next();
        }
    });
});

module.exports = router;
