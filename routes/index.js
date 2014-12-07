var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/index.js', function(req, res) {
    res.type('application/javascript');

    var recursive = require('recursive-readdir');

    // ignore files named 'foo.cs' or files that end in '.html'.
    recursive('../public/js', function(err, files) {
        // Files is an array of filename
        var relativeFiles = files.map(function(v) {
            return v.substring(13).replace(/\.js$/,'');
        });
        var jsFiles = relativeFiles.join('","');
        res.render('index', {
            currHost: req.protocol + "://" + req.host,
            jsFiles: jsFiles
        });
    });
});

module.exports = router;
