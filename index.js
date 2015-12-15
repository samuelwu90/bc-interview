'use strict';

var async = require('async');

var AWS = require('aws-sdk');

var app = require('express')();
var archiver = require('archiver');
var moment = require('moment');

var bucket = 'coding-challenges';

AWS.config.update({
        accessKeyId: 'AKIAIAQXHSX2YVLDOJYQ',
        secretAccessKey: '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'
});

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

var s3ToZip = function s3ToZip(prefix, filename, req, res){

    var s3 = new AWS.S3({apiVersion: '2006-03-01'});
    var startTime = new moment();
    var archive = archiver('zip');

    archive.on('error', function(err) {
        res.status(500).send({error: err.message});
    });

    //on stream closed we can end the request
    archive.on('end', function() {
        console.log('Archive wrote %d bytes', archive.pointer());
        console.log('Took: ', moment().diff(startTime), ' ms');
    });

    res.attachment(filename);

    archive.pipe(res);

    var params = {
      Bucket: bucket,
      Prefix: prefix
    };

    s3.listObjects(params, function(err, data){

        async.eachLimit(data.Contents, 1, function(object, cb){
            var stream = s3.getObject({Bucket: bucket, Key: object.Key}).createReadStream();

            stream.on('end', function(){
                console.log('finished streaming: ' + object.Key);
                return cb();
            });

            archive.append(stream, { name: object.Key.replace(prefix, '') });
        }, function(err){
            if(err) return res.status(500).send({error: err.message});
            archive.finalize();
        });

    });
}

app.get('/small', function (req, res) {

    var prefix = 'file_archiving/small_project/';
    var filename = 'small_project.zip';
    return s3ToZip(prefix, filename, req, res);

});

app.get('/medium', function (req, res) {

    var prefix = 'file_archiving/medium_project/';
    var filename = 'medium_project.zip';
    return s3ToZip(prefix, filename, req, res);

});

app.get('/large', function (req, res) {

    var prefix = 'file_archiving/large_project/';
    var filename = 'large_project.zip';
    return s3ToZip(prefix, filename, req, res);

});


// setInterval(function(){
//     console.log(util.inspect(process.memoryUsage()));
// }, 200)

app.listen(3000);
