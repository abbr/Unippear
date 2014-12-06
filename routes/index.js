var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/index.js', function(req, res) {
    res.type('application/javascript');
    res.render('index', {
        title: req.get('host')
    });
});

module.exports = router;
