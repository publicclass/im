'use strict';

/**
 * Module dependencies.
 */
var Stream = require('stream');
var spawn = require('child_process').spawn;
var ident = require('./ident');


/**
 * Export.
 */
module.exports = exports = ImageMagick;


/**
 * Define the `convert` and `identify` commands path. Defaults to `convert`
 * and `identify` (i.e. relying on the PATH env variable).
 */
exports.commands = {
  convert: 'convert',
  identify: 'identify'
};


/**
 * Stream based imagemagick wrapper.
 *
 * Takes a `Readable Stream` as and puts it through a `convert` process.
 *
 * @param {ReadableStream} input
 */
function ImageMagick(input){
  if( !(this instanceof ImageMagick) ) {
    return new ImageMagick(input);
  }

  if( !input || !input.on ) {
    throw new Error('input must be a readable stream');
  }

  if (input.pause) {
    input.pause();
  }
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
   * @param {Boolean} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#auto-orient
   * @returns {ImageMagick}
   */
  autoOrient: function(arg){
    if( arg || arg === undefined ) {
      this.args.push('-auto-orient');
    }
    return this;
  },

  /**
   * Coalesce.
   *
   * Adds a `-coalesce` argument. `arg` is a _boolean_.
   *
   * @param {Boolean} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#coalesce
   * @returns {ImageMagick}
   */
  coalesce: function(arg){
    if( arg || arg === undefined ) {
      this.args.push('-coalesce');
    }
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
    this.args.push('-crop', arg);
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
    this.args.push('-define', arg);
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
    this.args.push('-extent', arg);
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
    this.args.push('-filter', arg);
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
    this.args.push('-gravity', arg);
    return this;
  },

  /**
   * Interlace.
   *
   * Adds a `-interlace` argument. `arg` must be an _interlace type_ string,
   * which means any of `none`, `line`, `plane`, `partition`, `JPEG`, `GIF` or
   * `PNG`. Defaults to `none`.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#interlace
   * @returns {ImageMagick}
   */
  interlace: function(arg){
    this.args.push('-interlace', arg);
    return this;
  },

  /**
   * Layers.
   *
   * Adds a `-layers` argument. `arg` must be a _string_.
   *
   * @param {String} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#layers
   * @returns {ImageMagick}
   */
  layers: function(arg){
    this.args.push('-layers', arg);
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
    this.args.push('-liquid-rescale', arg);
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
    if (!isNaN(arg)) {
      this.args.push('-quality', arg);
    }
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
    this.args.push('-resize', arg);
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
    this.args.push('-rotate', arg);
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
    this.args.push('-sample', arg);
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
    this.args.push('-scale', arg);
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
    this.args.push('-sharpen', arg);
    return this;
  },

  /**
   * Strip.
   *
   * Adds a `-strip` argument. `arg` is a _boolean_.
   *
   * @param {Boolean} arg
   * @see http://www.imagemagick.org/script/command-line-options.php#strip
   * @returns {ImageMagick}
   */
  strip: function(arg){
    if( arg || arg === undefined ) {
      this.args.push('-strip');
    }
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
    this.args.push('-thumbnail', arg);
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
    this.args.push('-unsharp', arg);
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
    this.output = format + ':-';
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
    var stderr = '';
    this.proc = spawn(exports.commands.convert, ['-'].concat(this.args, this.output));
    this.proc.stdout.on('data', this.emit.bind(this, 'data'));
    this.proc.stdout.on('end', this.emit.bind(this, 'end'));
    this.proc.stderr.setEncoding('utf8');
    this.proc.stderr.on('data', function(d){ stderr += d; });
    this.proc.stderr.on('end', function() {
      if (stderr) {
        this.emit('error', ident.error(stderr));
      }
    }.bind(this));
    this.proc.on('error', this.emit.bind(this, 'error'));
    this.input.pipe(this.proc.stdin);
    if (this.input.resume) {
      this.input.resume();
    }
    if (output) {
      this.pipe(output);
    }
    return this;
  },

    /**
     * Identify.
     *
     * Spawns an `identify` process. Pass a callback `fn` which will receive
     * a parsed result as an Object.
     *
     * @param {Function} fn
     * @returns {ImageMagick}
     */
  identify: function(fn) {
    var stdout = '';
    var stderr = '';
    this.proc = spawn(exports.commands.identify, ['-verbose', '-']);
    this.proc.stdout.setEncoding('utf8');
    this.proc.stderr.setEncoding('utf8');
    this.proc.stdout.on('data', function(d){ stdout += d; });
    this.proc.stderr.on('data', function(d){ stderr += d; });
    this.proc.on('exit', function(code){
      if (code !== 0 || stderr) {
        fn(ident.error(stderr));
      } else if (stdout) {
        fn(null, ident.parse(stdout));
      } else {
        fn(null, '');
      }
    });
    this.proc.on('error', this.emit.bind(this, 'error'));
    this.input.pipe(this.proc.stdin);
    if (this.input.resume) {
      this.input.resume();
    }
    return this;
  }

};
