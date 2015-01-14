var express = require('express')
var router = express.Router()
var recursive = require('recursive-readdir')
var fs = require('fs')
var path = require('path')
var async = require('async')
var ejs = require('ejs')
var etag = require('etag')
var deasync = require('deasync')
var fileCompare = function(v1, v2) {
    if (typeof v1 !== 'string' || typeof v2 !== 'string') throw "invalid argument"
    var leveDiff = v1.split(path.sep).length - v2.split(path.sep).length
    switch (true) {
        case (leveDiff !== 0):
            return leveDiff
        default:
            return v1.localeCompare(v2)
    }
}


// Get combined.js
router.get('*/combined.js', function(req, res) {
    var thisFileUrlPath = req.params[0].replace(/\/$/, '')
    res.type('application/javascript')
    var jsPath = path.join(__dirname, '../', router.publicFolderNm, 'assets', thisFileUrlPath, '/js')
    recursive(path.resolve(jsPath), function(err, files) {
        if (!files) {
            return res.status(404).end()
        }
        files.sort(fileCompare)
        async.map(files, fs.readFile, function(err, outputs) {
            if (err) {
                console.error(err)
                res.status(500).end()
                return
            }
            var cnt = ''
            outputs.forEach(function(output, idx) {
                output = output.toString()
                if (path.extname(files[idx]) === '.ejs') {
                    output = ejs.render(output, {
                        "unippearHost": req.protocol + "://" + req.get('host'),
                        "thisFileUrlPath": path.dirname(files[idx]).substring(path.join(__dirname, '../', router.publicFolderNm, 'assets').length).replace(/\\/g, '/')
                    })
                }
                cnt += output + '\n'
            })
            res.setHeader('ETag', etag(cnt))
            res.setHeader('Cache-Control', 'max-age=0')
            if (req.get('if-none-match') === res.get('etag')) {
                res.status(304).end()
            }
            else {
                res.end(cnt)
            }
        })
    })
})


/* GET home page. */
router.get(/^(.*)\/(index\.js)?$/, function(req, res) {
    var thisFileUrlPath = req.params[0].replace(/\/$/, '')
    res.type('application/javascript')
    var cssPath = path.join(__dirname, '../', router.publicFolderNm, '/assets', thisFileUrlPath, '/css')
    recursive(cssPath, function(err, files) {
        var cssFiles = (files || []).map(function(v) {
            return req.protocol + "://" + req.get('host') + thisFileUrlPath + v.substring(cssPath.length - 4).replace(/\.ejs$/, '').replace(/\\/g, '/')
        })

        cssFiles.sort(fileCompare)
        var jsFiles = ['combined.js']
        if (!router.combineJs) {
            var jsPath = path.join(__dirname, '../', router.publicFolderNm, '/assets', thisFileUrlPath, '/js/')
            var drecursive = deasync(recursive)
            try {
                jsFiles = (drecursive(jsPath) || []).map(function(v) {
                    return 'js/' + v.substring(jsPath.length).replace(/\.ejs$/, '')
                })
                jsFiles.sort(fileCompare)
            }
            catch (err) {}
        }
        res.render('api/index', {
            "unippearHost": req.protocol + "://" + req.get('host'),
            "thisFileUrlPath": thisFileUrlPath,
            "cssFiles": cssFiles,
            "jsFiles": jsFiles
        }, function(err, cnt) {
            res.setHeader('ETag', etag(cnt))
            res.setHeader('Cache-Control', 'max-age=0')
            if (req.get('if-none-match') === res.get('etag')) {
                res.status(304).end()
            }
            else {
                res.end(cnt)
            }
        })
    })
})


// Get all ejs assets
router.get('*/*', function(req, res, next) {
    var thisFileUrlPath = req.params[0].replace(/\/$/, '')

    require('fs').exists(path.join(__dirname, '..', router.publicFolderNm, 'assets', req.path + '.ejs'), function(exists) {
        if (exists) {
            res.type(path.extname(req.path))
            res.render(path.join('assets', req.path + '.ejs'), {
                unippearHost: req.protocol + "://" + req.get('host'),
                "thisFileUrlPath": thisFileUrlPath
            }, function(err, cnt) {
                res.setHeader('ETag', etag(cnt))
                res.setHeader('Cache-Control', 'max-age=0')
                if (req.get('if-none-match') === res.get('etag')) {
                    res.status(304).end()
                }
                else {
                    res.end(cnt)
                }
            })
        }
        else {
            next()
        }
    })
})

module.exports = router
