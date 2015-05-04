/*eslint-env mocha */
'use strict';

var im = require('../');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var request = require('superagent');
var s3;


// only run S3 tests when ENV keys are set
if( process.env.S3_KEY && process.env.S3_SECRET && process.env.S3_BUCKET ){
  var S3FS = require('s3fs');
  s3 = new S3FS(process.env.S3_BUCKET, {
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET
  });
}


describe('ImageMagick', function() {

  var dir = path.resolve(__dirname, 'output');

  before(function(next) {
    fs.mkdir(dir, function() { next(); });
  });

  describe('http', function() {
    var url = 'http://ia600604.us.archive.org/21/items/5574288223_f1de5c4692_o/5574288223_f1de5c4692_o_thumb.jpg';

    it('should crop', function(done) {
      var input = request.get(url)
        , output = fs.createWriteStream(path.resolve(dir, 'http_crop_40x40.png'));
      im(input)
        .crop('40x40+90+90')
        .convert(output)
        .on('end', done);
    });

    it('should resize (w. pipe)', function(done) {
      var input = request.get(url)
        , output = fs.createWriteStream(path.resolve(dir, 'http_resize_200x200.png'));
      im(input)
        .resize('200x200')
        .convert()
        .pipe(output)
        .on('close', done);
    });

    it('should crop and resize', function(done) {
      var input = request.get(url)
        , output = fs.createWriteStream(path.resolve(dir, 'http_crop_40x40_resize_200x200.png'));
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end', done);
    });

    it('should identify', function(done) {
      var input = request.get(url);
      im(input)
        .identify(function(err, ident) {
          if (err) {
            return done(err);
          }
          assert(typeof ident === 'object');
          assert(typeof ident.gamma === 'number');
          assert(ident.verbose === true);
          done(err);
        });
    });

    it('should fail on non-image streams', function(done) {
      var input = request.get('http://httpbin.org/get')
        , output = fs.createWriteStream(path.resolve(dir, 'http_json_fail.png'));
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('error', function(err) {
          assert(err.message === 'no images defined');
          done();
        });
    })

    if( !s3 ) {
      return;
    }

    it('should send to s3', function(done) {
      var input = request.get(url)
        , output = s3.createWriteStream('/http_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end', done);
    });

  });

  describe('fs', function() {
    var file = path.resolve(__dirname, '400.jpg');

    it('should crop', function(done) {
      var input = fs.createReadStream(file)
        , output = fs.createWriteStream(path.resolve(dir, 'file_crop_40x40.jpg'));
      im(input)
        .crop('40x40+90+90')
        .convert(output)
        .on('end', done);
    });

    it('should resize', function(done) {
      var input = fs.createReadStream(file)
        , output = fs.createWriteStream(path.resolve(dir, 'file_resize_200x200.jpg'));
      im(input)
        .resize('200x200')
        .convert(output)
        .on('end', done);
    });

    it('should crop and resize', function(done) {
      var input = fs.createReadStream(file)
        , output = fs.createWriteStream(path.resolve(dir, 'file_resize_200x200_crop_40x40.jpg'));
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end', done);
    });

    it('should make a progressive JPEG', function(done) {
      var input = fs.createReadStream(file)
        , output = fs.createWriteStream(path.resolve(dir, 'file_progressive.jpg'));
      im(input)
        .interlace('plane')
        .convert(output)
        .on('end', done);
    });

    it('should identify', function(done) {
      var input = fs.createReadStream(file);
      im(input)
        .identify(function(err, ident) {
          assert(typeof ident === 'object');
          assert(typeof ident.gamma === 'number');
          assert(typeof ident.quality === 'number');
          assert(ident.verbose === true);
          done(err);
        });
    });

    if( !s3 ) {
      return;
    }

    it('should send to s3 (w. pipe)', function(done) {
      var input = fs.createReadStream(file)
        , output = s3.createWriteStream('/file_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert()
        .pipe(output)
          .on('finish', function() { done(); });
    });

  });

  if (!s3) {
    return;
  }

  describe('s3', function() {

    var file = '/file_crop_40x40_resize_200x200.png';

    before(function(done) {
      s3.exists(file).then(function(exists) {
        if (!exists) {
          return new Promise(function(resolve, reject) {
            var local = path.resolve(dir, 'file_resize_200x200_crop_40x40.jpg');
            fs.readFile(local, function(err, data) {
              if (err) { return reject(err); }
              resolve(data);
            });
          }).then(function(data) {
            return s3.writeFile(file, data);
          });
        } else {
          return Promise.resolve();
        }
      }).then(done, done);
    });

    it('should crop', function(done) {
      var input = s3.createReadStream(file);
      var output = fs.createWriteStream(path.resolve(dir, 's3_crop_40x40.jpg'));
      im(input)
        .crop('40x40+90+90')
        .convert(output)
        .on('end', done);
    });

    it('should resize', function(done) {
      var input = s3.createReadStream(file);
      var output = fs.createWriteStream(path.resolve(dir, 's3_resize_200x200.jpg'));
      im(input)
        .resize('200x200')
        .convert(output)
        .on('end', done);
    });

    it('should crop and resize', function(done) {
      var input = s3.createReadStream(file);
      var output = fs.createWriteStream(path.resolve(dir, 's3_resize_200x200_crop_40x40.jpg'));
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end', done);
    });

    it('should send to s3 (w. pipe)', function(done) {
      var input = s3.createReadStream(file);
      var output = s3.createWriteStream('/s3_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert()
        .pipe(output)
          .on('finish', function(){ done(); });
    });

    it('should identify', function(done) {
      var input = s3.createReadStream(file);
      im(input)
        .identify(function(err, ident) {
          assert(typeof ident === 'object');
          assert(typeof ident.gamma === 'number');
          assert(typeof ident.quality === 'number');
          assert(ident.verbose === true);
          done(err);
        });
    });


  });

});
