var express = require('express');
var router = express.Router();
var recursive = require('recursive-readdir');
var fs = require('fs');
var path = require('path');
var async = require('async');
var ejs = require('ejs');
var etag = require('etag');

/* GET home page. */
router.get('*/index.js', function(req, res) {
    res.type('application/javascript');
    var cssPath = path.join(__dirname, '../', router.publicFolderNm, '/assets', req.params[0], '/css');
    recursive(cssPath, function(err, files) {
        var cssFiles = (files || []).map(function(v) {
            return req.protocol + "://" + req.host + req.params[0] + v.substring(cssPath.length - 4).replace(/\.ejs$/, '');
        });
        if (router.combineJs) {
            res.render('api/index', {
                "unippearHost": req.protocol + "://" + req.host,
                "thisFileUrlPath": req.params[0],
                "cssFiles": cssFiles
            });
            return;
        }
        var jsPath = path.join(__dirname, '../', router.publicFolderNm, '/assets', req.params[0], '/js/');
        recursive(jsPath, function(err, files) {
            var jsFiles = (files || []).map(function(v) {
                return v.substring(jsPath.length).replace(/\.ejs$/, '');
            });
            res.render('api/index', {
                "unippearHost": req.protocol + "://" + req.host,
                "thisFileUrlPath": req.params[0],
                "jsFiles": jsFiles,
                "cssFiles": cssFiles
            });
        });
    });
});

// Get combined.js
router.get('*/combined.js', function(req, res) {
    res.type('application/javascript');
    var jsPath = path.join(__dirname, '../', router.publicFolderNm, 'assets', req.params[0], '/js');
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
                        "unippearHost": req.protocol + "://" + req.host,
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

// Get all ejs assets
router.get('*/*', function(req, res, next) {
    require('fs').exists(path.join(__dirname, '..', router.publicFolderNm, 'assets', req.path + '.ejs'), function(exists) {
        if (exists) {
            res.type(path.extname(req.path));
            res.render(path.join('assets', req.path + '.ejs'), {
                unippearHost: req.protocol + "://" + req.host,
                "thisFileUrlPath": req.params[0]
            });
        }
        else {
            next();
        }
    });
});


module.exports = router;
