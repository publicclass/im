var im = require('../')
  , EventEmitter = require('events').EventEmitter
  , assert = require('assert')
  , fs = require('fs')
  , request = require('superagent');

describe('ImageMagick',function(){

  var dir = __dirname+'/output';

  before(function(){
    try{fs.mkdirSync(dir)} catch(e){}
  })

  describe('http',function(){
    var url = 'http://placekitten.com/500/500';

    it('should crop',function(done){
      var input = request.get(url)
        , output = fs.createWriteStream(dir+'/http_crop_40x40.png');
      im(input)
        .crop('40x40+90+90')
        .convert(output)
        .on('end',done)
    })

    it('should resize (w. pipe)',function(done){
      var input = request.get(url)
        , output = fs.createWriteStream(dir+'/http_resize_200x200.png');
      im(input)
        .resize('200x200')
        .convert()
        .pipe(output)
        .on('close',done)
    })

    it('should crop and resize',function(done){
      var input = request.get(url)
        , output = fs.createWriteStream(dir+'/http_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end',done)
    })

  })

  describe('fs',function(){
    var path = __dirname+'/explode_problem.jpg';

    it('should crop',function(done){
      var input = fs.createReadStream(path)
        , output = fs.createWriteStream(dir+'/file_crop_40x40.jpg');
      im(input)
        .crop('40x40+90+90')
        .convert(output)
        .on('end',done)
    })

    it('should resize',function(done){
      var input = fs.createReadStream(path)
        , output = fs.createWriteStream(dir+'/file_resize_200x200.jpg');
      im(input)
        .resize('200x200')
        .convert(output)
        .on('end',done)
    })

    it('should crop and resize',function(done){
      var input = fs.createReadStream(path)
        , output = fs.createWriteStream(dir+'/file_resize_200x200_crop_40x40.jpg');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end',done)
    })
  })

})
