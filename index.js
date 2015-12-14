var async = require('async');
var _ = require('lodash');
var AWS = require('aws-sdk');
var app = require('express')();
var archiver = require('archiver');
var p = require('path');
var fs = require('fs');

var bucket = 'coding-challenges';

AWS.config.update({
        accessKeyId: 'AKIAIAQXHSX2YVLDOJYQ',
        secretAccessKey: '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'
});

app.set('view engine', 'jade');

app.get('/', function (req, res) {
  res.render('index', { title: 'Hey', message: 'Hello there!'});
});

app.get('/small', function (req, res) {

    var archive = archiver('zip');
    var prefix = 'file_archiving/small_project/';

    archive.on('error', function(err) {
        res.status(500).send({error: err.message});
    });

    //on stream closed we can end the request
    archive.on('end', function() {
        console.log('Archive wrote %d bytes', archive.pointer());
    });

    res.attachment('small_project.zip');

    archive.pipe(res);

    var s3 = new AWS.S3({apiVersion: '2006-03-01'});

    var params = {
      Bucket: bucket,
      Prefix: prefix
    };

    s3.listObjects(params, function(err, data){
        _.each(data.Contents, function(object){
            archive.append(s3.getObject({Bucket: bucket, Key: object.Key}).createReadStream(), { name: object.Key.replace(prefix, '') });
        })
        archive.finalize();
    })

});

app.get('/medium', function (req, res) {

    var archive = archiver('zip');
    var prefix = 'file_archiving/medium_project/';

    archive.on('error', function(err) {
        res.status(500).send({error: err.message});
    });

    //on stream closed we can end the request
    archive.on('end', function() {
        console.log('Archive wrote %d bytes', archive.pointer());
    });

    res.attachment('medium_project.zip');

    archive.pipe(res);

    var s3 = new AWS.S3({apiVersion: '2006-03-01'});

    var params = {
      Bucket: bucket,
      Prefix: prefix
    };

    s3.listObjects(params, function(err, data){
        _.each(data.Contents, function(object){
            archive.append(s3.getObject({Bucket: bucket, Key: object.Key}).createReadStream(), { name: object.Key.replace(prefix, '') });
        })
        archive.finalize();
    })

});

app.get('/large', function (req, res) {

    var archive = archiver('zip');
    var prefix = 'file_archiving/large_project/';

    archive.on('error', function(err) {
        res.status(500).send({error: err.message});
    });

    //on stream closed we can end the request
    archive.on('end', function() {
        console.log('Archive wrote %d bytes', archive.pointer());
    });

    res.attachment('large_project.zip');

    archive.pipe(res);

    var s3 = new AWS.S3({apiVersion: '2006-03-01'});

    var params = {
      Bucket: bucket,
      Prefix: prefix
    };

    s3.listObjects(params, function(err, data){
        console.log(data.Contents.length)
        async.eachLimit(data.Contents, 10, function(object, cb){
            var stream = s3.getObject({Bucket: bucket, Key: object.Key}).createReadStream();

            stream.on('end', function(){
                console.log('finished streaming: ' + object.Key)
                return cb();
            })

            archive.append(stream, { name: object.Key.replace(prefix, '') });
        }, function(err){
            archive.finalize();
        })
    })

});

app.listen(3000);
