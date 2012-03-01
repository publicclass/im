var im = require('../')
  , EventEmitter = require('events').EventEmitter
  , assert = require('assert')
  , fs = require('fs')
  , request = require('superagent')
  , s3;


// only run S3 tests when ENV keys are set
if( process.env.S3_KEY && process.env.S3_SECRET && process.env.S3_BUCKET ){
  s3 = require('knox').createClient({
    key: process.env.S3_KEY,
    secret: process.env.S3_SECRET,
    bucket: process.env.S3_BUCKET
  });
}


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

    if( !s3 )
      return;

    it('should send to s3',function(done){
      var input = request.get(url)
        , output = s3.createWriteStream('/http_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end',done)
    })

  })

  describe('fs',function(){
    var path = __dirname+'/400.jpg';

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

    if( !s3 )
      return;

    it('should send to s3 (w. pipe)',function(done){
      var input = fs.createReadStream(path)
        , output = s3.createWriteStream('/file_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert()
        .pipe(output)
          .on('response',function(res){done()})
    })

  })

  if( !s3 )
    return;

  describe('s3',function(){

    // TODO I would like to use `s3.get()` but it returns a ClientRequest 
    //      which doesn't pass along the events as nicely as superagent...

    var path = '/file_crop_40x40_resize_200x200.png'
      , expiration = new Date(Date.now()+1000*60*60*24)
      , url = s3.signedUrl(path,expiration);

    it('should crop',function(done){
      var input = request.get(url)
        , output = fs.createWriteStream(dir+'/s3_crop_40x40.jpg');
      im(input)
        .crop('40x40+90+90')
        .convert(output)
        .on('end',done)
    })

    it('should resize',function(done){
      var input = request.get(url)
        , output = fs.createWriteStream(dir+'/s3_resize_200x200.jpg');
      im(input)
        .resize('200x200')
        .convert(output)
        .on('end',done)
    })

    it('should crop and resize',function(done){
      var input = request.get(url)
        , output = fs.createWriteStream(dir+'/s3_resize_200x200_crop_40x40.jpg');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert(output)
        .on('end',done)
    })

    it('should send to s3 (w. pipe)',function(done){
      var input = request.get(url)
        , output = s3.createWriteStream('/s3_crop_40x40_resize_200x200.png');
      im(input)
        .crop('40x40+90+90')
        .resize('200x200')
        .convert()
        .pipe(output)
          .on('response',function(res){done()})
    })

  })

})
