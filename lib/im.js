
/**
 * Module dependencies.
 */
var Stream = require('stream')
  , spawn = require('child_process').spawn;


/** 
 * Export.
 */
module.exports = exports = ImageMagick;


/**
 * Define the `convert` commands path. Defaults to `convert`.
 */
exports.command = 'convert';


/**
 * Stream based imagemagick wrapper.
 *
 * Takes a `Readable Stream` as and puts it through a `convert` process.
 *
 * @param {ReadableStream} input
 */
function ImageMagick(input){
  if( !(this instanceof ImageMagick) )
    return new ImageMagick(input);

  if( !input || !input.on )
    throw new Error('input must be a readable stream');

  input.pause && input.pause();
  this.input = input;
  this.output = '-';
  this.args = [];
}

ImageMagick.prototype.__proto__ = Stream.prototype;


/**
 * Crop.
 *
 * Adds crop parameters. `arg` must be an _Image Geometry_ string.
 *
 * @param {String} arg
 * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
 * @returns {ImageMagick}
 */
ImageMagick.prototype.crop = function(arg){
  this.args.push('-crop',arg)
  return this;
}

/**
 * Resize.
 *
 * Adds resize parameters. `arg` must be an _Image Geometry_ string.
 *
 * @param {String} arg
 * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
 * @returns {ImageMagick}
 */
ImageMagick.prototype.resize = function(arg){
  this.args.push('-resize',arg)
  return this;
}

/**
 * Format.
 *
 * Sets the output format.
 *
 * @param {String} format
 * @see `convert -list format`
 * @see 
 */
ImageMagick.prototype.format = function(format){
  this.output = format+':'-''
  return this;
}

/**
 * Convert.
 *
 * Spawns a `convert` process. Pass `output` or `.pipe()` to stream it to a file
 * or something other that handles streams.
 *
 * @param {WritableStream} output
 * @returns {ImageMagick}
 */
ImageMagick.prototype.convert = function(output){
  this.proc = spawn(exports.command,['-'].concat(this.args,this.output))
  this.proc.stderr.on('data',this.emit.bind(this,'error'))
  this.proc.stdout.on('data',this.emit.bind(this,'data'))
  this.proc.stdout.on('end',this.emit.bind(this,'end'))
  this.proc.on('error',this.emit.bind(this,'error'))
  this.input.pipe(this.proc.stdin)
  this.input.resume && this.input.resume()
  output && this.pipe(output);
  return this;
}
