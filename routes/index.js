var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    res.type('application/javascript');

    var recursive = require('recursive-readdir');

    recursive('../' + router.publicFolderNm + '/static/js', function(err, files) {
        // Files is an array of filename
        var jsFiles = files.map(function(v) {
            return v.substring(router.publicFolderNm.length + 14).replace(/\.ejs$/, '');
        });

        recursive('../' + router.publicFolderNm + '/static/css', function(err, files) {
            // Files is an array of filename
            var cssFiles = files.map(function(v) {
                return req.protocol + "://" + req.host + v.substring(router.publicFolderNm.length + 10).replace(/\.ejs$/, '');
            });
            res.render('api/index', {
                currHost: req.protocol + "://" + req.host,
                jsFiles: jsFiles,
                cssFiles: cssFiles
            });
        });
    });
});

module.exports = router;
