var express = require('express');
var router = express.Router();
var recursive = require('recursive-readdir');
var fs = require('fs');
var path = require('path');
var async = require('async');
var ejs = require('ejs');
var etag = require('etag');

/* GET home page. */
router.get('/index.js', function(req, res) {
    res.type('application/javascript');
    var cssPath = path.join(__dirname, '../', router.publicFolderNm, '/assets/css');
    recursive(cssPath, function(err, files) {
        var cssFiles = (files || []).map(function(v) {
            return req.protocol + "://" + req.host + v.substring(cssPath.length - 4).replace(/\.ejs$/, '');
        });
        if (router.combineJs) {
            res.render('api/index', {
                "unippearHost": req.protocol + "://" + req.host,
                "cssFiles": cssFiles
            });
            return;
        }
        var jsPath = path.join(__dirname, '../', router.publicFolderNm, '/assets/js');
        recursive(jsPath, function(err, files) {
            var jsFiles = (files || []).map(function(v) {
                return v.substring(jsPath.length).replace(/\.ejs$/, '');
            });
            res.render('api/index', {
                "unippearHost": req.protocol + "://" + req.host,
                "jsFiles": jsFiles,
                "cssFiles": cssFiles
            });
        });
    });
});

router.get('/combined.js', function(req, res) {
    res.type('application/javascript');
    var jsPath = path.join(__dirname, '../', router.publicFolderNm, '/assets/js');
    recursive(path.resolve(jsPath), function(err, files) {
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
                        "unippearHost": req.protocol + "://" + req.host
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

module.exports = router;
