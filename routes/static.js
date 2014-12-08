var express = require('express');
var router = express.Router();

router.get('/*', function(req, res) {
    res.render('index', {
        currHost: req.protocol + "://" + req.host
    });
});

module.exports = router;
