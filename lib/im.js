
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


ImageMagick.prototype = {

  /**
   * Inherits from Stream
   */
  __proto__: Stream.prototype,

  /**
   * Auto Orient.
   *
   * Adds a `-auto-orient` argument. `arg` is a _boolean_.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#auto-orient
   * @returns {ImageMagick}
   */
  autoOrient: function(arg){
    if( arg || arg === undefined )
      this.args.push('-auto-orient')
    return this;
  },

  /**
   * Crop.
   *
   * Adds a `-crop` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#crop
   * @returns {ImageMagick}
   */
  crop: function(arg){
    this.args.push('-crop',arg)
    return this;
  },

  /**
   * Extent.
   *
   * Adds an `-extent` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#extent
   * @returns {ImageMagick}
   */
  extent: function(arg){
    this.args.push('-extent',arg)
    return this;
  },

  /**
   * Define.
   *
   * Adds a `-define` argument. `arg` must be a _setting_. See docs for more info.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#define
   * @returns {ImageMagick}
   */
  define: function(arg){
    this.args.push('-define',arg)
    return this;
  },

  /**
   * Filter.
   *
   * Adds a `-filter` argument. `arg` must be a _type_. See docs for more info.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#filter
   * @returns {ImageMagick}
   */
  filter: function(arg){
    this.args.push('-filter',arg)
    return this;
  },

  /**
   * Gravity.
   *
   * Adds a `-gravity` argument. `arg` must be an _gravity type_ string, which 
   * means any of `NorthWest`, `North`, `NorthEast`, `West`, `Center`, `East`, 
   * `SouthWest`, `South` or `SouthEast`. Defaults to `NorthWest`.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#gravity
   * @returns {ImageMagick}
   */
  gravity: function(arg){
    this.args.push('-gravity',arg)
    return this;
  },

  /**
   * Liquid Rescale.
   *
   * Adds a `-liquid-rescale` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#liquid-rescale
   * @returns {ImageMagick}
   */
  liquidRescale: function(arg){
    this.args.push('-liquid-rescale',arg)
    return this;
  },

  /**
   * Quality.
   *
   * Adds a `-quality` argument. `arg` is a number between `1` and `100` for JPEGs
   * (default is based on input quality or `92`) and between `1` and `10` for 
   * PNGs (defaults to `7`).
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#quality
   * @returns {ImageMagick}
   */
  quality: function(arg){
    if( !isNaN(arg) )
      this.args.push('-quality',arg)
    return this;
  },

  /**
   * Resize.
   *
   * Adds a `-resize` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#resize
   * @returns {ImageMagick}
   * @returns {ImageMagick}
   */
  resize: function(arg){
    this.args.push('-resize',arg)
    return this;
  },

  /**
   * Rotate.
   *
   * Adds a `-rotate` argument. `arg` is the degrees with an optional `<` or- `>`
   * -suffix which makes it only rotate depending on the width/height ratio.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#rotate
   * @returns {ImageMagick}
   */
  rotate: function(arg){
    this.args.push('-rotate',arg)
    return this;
  },

  /**
   * Sample.
   *
   * Adds a `-sample` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#sample
   * @returns {ImageMagick}
   */
  sample: function(arg){
    this.args.push('-sample',arg)
    return this;
  },

  /**
   * Scale.
   *
   * Adds a `-scale` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#scale
   * @returns {ImageMagick}
   */
  scale: function(arg){
    this.args.push('-scale',arg)
    return this;
  },

  /**
   * Sharpen.
   *
   * Adds a `-sharpen` argument. `arg` is the radius of the Gaussian operator or 
   * radius plus sigma. Ex. `radiusxsigma+bias`.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#sharpen
   * @returns {ImageMagick}
   */
  sharpen: function(arg){
    this.args.push('-sharpen',arg)
    return this;
  },

  /**
   * Strip.
   *
   * Adds a `-strip` argument. `arg` is a _boolean_.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#strip
   * @returns {ImageMagick}
   */
  strip: function(arg){
    if( arg || arg === undefined )
      this.args.push('-strip')
    return this;
  },

  /**
   * Thumbnail.
   *
   * Adds a `-thumbnail` argument. `arg` must be an _Image Geometry_ string.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-processing.php#geometry
   * @see http://www.imagemagick.org/script/command-line-options.php#thumbnail
   * @returns {ImageMagick}
   */
  thumbnail: function(arg){
    this.args.push('-thumbnail',arg)
    return this;
  },

  /**
   * Unsharp.
   *
   * Adds a `-unsharp` argument. `arg` is the radius of the Gaussian operator or 
   * radius plus sigma. Ex. `radiusxsigma{+amount}{+threshold}`.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#unsharp
   * @returns {ImageMagick}
   */
  unsharp: function(arg){
    this.args.push('-unsharp',arg)
    return this;
  },

  /**
   * Format.
   *
   * Sets the output format.
   *
   * @param {String} format
   * @see `convert -list format`
   * @see 
   */
  format: function(format){
    this.output = format+':-'
    return this;
  },

  /**
   * Convert.
   *
   * Spawns a `convert` process. Pass `output` or `.pipe()` to stream it to a file
   * or something other that handles streams.
   *
   * @param {WritableStream} output
   * @returns {ImageMagick}
   */
  convert: function(output){
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

}


