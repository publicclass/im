/*eslint-env mocha*/
'use strict';

var ident = require('../lib/ident');
var path = require('path');
var fs = require('fs');

var jpg = fs.readFileSync(path.resolve(__dirname, 'fixtures/identify-jpg.txt'), 'utf8');
var pdf = fs.readFileSync(path.resolve(__dirname, 'fixtures/identify-pdf.txt'), 'utf8');
var gif = fs.readFileSync(path.resolve(__dirname, 'fixtures/identify-gif.txt'), 'utf8');
var err = fs.readFileSync(path.resolve(__dirname, 'fixtures/identify-err.txt'), 'utf8');
var con = fs.readFileSync(path.resolve(__dirname, 'fixtures/convert-err.txt'), 'utf8');

describe('ident', function() {

  it('should parse a jpg', function() {
    var obj = ident.parse(jpg);
    obj.should.be.a('object');
    obj.should.have.property('image', '/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-AvR72l6Z');
    obj.should.have.property('baseFilename', '-');
    obj.should.have.property('format').include('JPEG');
    obj.should.have.property('geometry');
    obj.should.have.property('type');
    obj.should.have.property('resolution');
    obj.should.have.property('properties');
    obj.properties.should.have.property('dateCreate');
    obj.properties.should.have.property('dateModify');
  });

  it('should parse a pdf', function() {
    var obj = ident.parse(pdf);
    obj.should.be.a('object');
    obj.should.have.property('image', '/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-ggBPXvKO');
    obj.should.have.property('baseFilename', '-');
    obj.should.have.property('format').include('PDF');
    obj.should.have.property('geometry');
    obj.should.have.property('type');
    obj.should.have.property('resolution');
    obj.should.have.property('colors');
    obj.should.have.property('properties');
    obj.properties.should.have.property('dateCreate');
    obj.properties.should.have.property('dateModify');
  });

  it('should parse an animated gif', function() {
    var arr = ident.parse(gif);
    arr.should.be.instanceof(Array);
    arr.should.have.length(5);
    arr.forEach(function(obj) {
      obj.should.be.a('object');
      obj.should.have.property('image', 'original.gif');
      obj.should.have.property('format').include('GIF (CompuServe graphics interchange format)');
      obj.should.have.property('geometry');
      obj.should.have.property('type');
      obj.should.have.property('resolution');
      obj.should.have.property('colors');
      obj.should.have.property('properties');
      obj.properties.should.have.property('dateCreate');
      obj.properties.should.have.property('dateModify');
    });
  });

  it('should parse a "Corrupt data"-error string', function() {
    var e = ident.error(err);
    e.should.have.property('status', 422);
    e.should.have.property('code', 'corrupt');
    e.should.have.property('message', 'Premature end of JPEG file');
    e.should.have.property('description', 'Corrupt JPEG data: premature end of data segment');
    e.should.have.property('filename', '/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-fECuVcfB');
  });

  it('should parse a "invalid argument"-error string', function() {
    var e = ident.error(con);
    e.should.have.property('status', 422);
    e.should.have.property('code', 'invalid_argument');
    e.should.have.property('message', 'invalid argument for option `-resize\': 800+0+0');
    // e.should.have.property('description', 'no decode delegate for this image format') // TODO this should probably be more descriptive...
    e.should.have.property('filename', '/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-mI6bV7wa');
  });

});
