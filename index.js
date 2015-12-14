var AWS = require('aws-sdk');
var app = require('express')();
var archiver = require('archiver');
var p = require('path');
var fs = require('fs');

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

    archive.on('error', function(err) {
        res.status(500).send({error: err.message});
    });

    //on stream closed we can end the request
    archive.on('end', function() {
        console.log('Archive wrote %d bytes', archive.pointer());
    });

    res.attachment('small.zip');

    archive.pipe(res);

    var s3 = new AWS.S3({apiVersion: '2006-03-01'});

    var params = {
      Bucket: 'coding-challenges', /* required */
      Prefix: 'file_archiving/small_project'
    };

    archive.append(s3.getObject({Bucket: 'coding-challenges', Key: 'file_archiving/small_project/file_1.pdf'}).createReadStream(), { name: 'file_1.pdf' })
    archive.append(s3.getObject({Bucket: 'coding-challenges', Key: 'file_archiving/small_project/file_2.pdf'}).createReadStream(), { name: 'file_2.pdf' })
    archive.finalize();


});

app.listen(3000);
