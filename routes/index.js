var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/*', function(req, res) {
    res.type('application/javascript');

    var recursive = require('recursive-readdir');

    recursive('../' + router.publicFolderNm + '/js', function(err, files) {
        // Files is an array of filename
        var relativeFiles = files.map(function(v) {
            return v.substring(router.publicFolderNm.length + 7).replace(/\.js$/, '');
        });
        var jsFiles = relativeFiles.join('","');

        recursive('../' + router.publicFolderNm + '/css', function(err, files) {
            // Files is an array of filename
            var cssFiles = files.map(function(v) {
                return req.protocol + "://" + req.host + v.substring(router.publicFolderNm.length + 3);
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
