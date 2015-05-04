'use strict';

var RE_IDENT = /^((?: {2})*)([^:]+): *([^\n]*)\n*/
  , RE_ERROR = /(identify|convert): *([^@]+?)(?:`([^']+)')? @ (.+?)$/m
  , RE_FIX_KEY = /^(\S+): /
  , RE_CAMEL = /[ -](\w)/ig;

/**
 * Parse the results from an `identify -verbose` command.
 *
 * Converts the indented output of stdout, passed in as `input` into
 * an array of parsed _frame_-objects.
 *
 * @param {String} input
 * @return {Array}
 */
exports.parse = function parse(input){
  // split on each frame
  var frames = input.split(/^(?=I)/gm);
  var idents = frames.map(function(str) {
    var ident = {};
    var stack = [ident];
    var md;

    // trick Image: to be indented like the rest
    str = '  ' + str;

    while ((md = RE_IDENT.exec(str))) {
      var depth = md[1].split('  ').length - 1;
      var key = md[2];
      var val = md[3];

      // fix dates and other keys that contain a colon
      if (RE_FIX_KEY.test(val)) {
        key += ' ' + val.slice(0, RegExp.$1.length);
        val = val.slice(RegExp.$1.length + 2);
      }

      // camel case the keys
      key = key.toLowerCase().replace(RE_CAMEL, toUpper);

      // parse dates into Date
      if (key.indexOf('date') === 0) {
        val = new Date(val);
      } else if (val.toLowerCase() === 'true') {
        val = true;
      } else if (val.toLowerCase() === 'false') {
        val = false;
      } else if (parseFloat(val).toString() === val) {
        val = parseFloat(val);
      } else if (!val) {
        val = undefined;
      }

      while (depth < stack.length) {
        ident = stack.pop();
      }

      // color map uses it's length as val
      // but by ignoring it the colors will
      // be parsed properly
      if (key === 'colormap') {
        val = undefined;
      }

      if (val !== undefined){
        ident[key] = val;
      } else {
        stack.push(ident);
        ident = ident[key] = {};
      }

      str = str.slice(md[0].length);
    }

    return stack[0];
  });

  if (frames.length === 1) {
    return idents[0];
  } else {
    return idents;
  }
};

/**
 * Parse and error from the `identify` command.
 *
 * Example:
 *
 *    identify: Premature end of JPEG file `/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-fECuVcfB' @ warning/jpeg.c/JPEGWarningHandler/325.
 *    identify: Corrupt JPEG data: premature end of data segment `/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-fECuVcfB' @ warning/jpeg.c/JPEGWarningHandler/325.
 *
 *    or convert error
 *
 *    convert: no decode delegate for this image format `/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-SHSPWL4n' @ error/constitute.c/ReadImage/532.
 *    convert: invalid argument for option `-resize': 800+0+0 @ error/convert.c/ConvertImageCommand/2355.
 *
 *  will become something like:
 *
 *    var err = new Error('Premature end of JPEG file')
 *    err.code = 400; // An HTTP status code
 *    err.filename = '/var/folders/_n/pchsjj1d6jqdkd05yjx2tz0c0000gn/T/magick-fECuVcfB';
 *    err.description = 'Corrupt JPEG data: premature end of data segment';
 *    err.raw = str;
 *
 * @param {String} raw
 * @return {Error}
 */
exports.error = function error(raw){
  var err
    , cmd
    , file
    , messages = []
    , md
    , str = raw;

  while ((md = RE_ERROR.exec(str))) {
    cmd = md[1] || cmd;
    file = md[3] || file;

    // Store the messages to create an error
    // with when we figure out the type
    messages.push(md[2].trim().replace(/\\'/g, '\''));

    str = str.slice(md.index + md[0].length);
  }

  // Figure out the code by looking for keywords
  // TODO Add more cases
  switch(true){
    // Error for a corrupt image file.
    case /Corrupt/.test(raw):
      err = new Error(messages.shift());
      err.description = messages.shift();
      err.status = 422;
      err.code = 'corrupt';
      break;

    // Error when trying to identify an xml in which it does into
    // "raw image"-mode in which it requires a size to be set.
    case /must specify image size/.test(raw):
      err = new Error(messages.shift());
      err.description = messages.shift();
      err.status = 422;
      err.code = 'unsupported_type';
      break;

    // Error when there's no input. Usually cause by a failed input stream.
    case /no decode delegate for this image format/.test(raw):

    // Error when the output is not really set, in which it'll just be
    // a `-`.
    case /missing an image filename/.test(raw):

    // Error when trying to convert with an invalid argument.
    // Usually caused by invalid profiles.
    case /invalid argument/.test(raw):
      err = new Error(messages.pop());
      err.description = messages.shift();
      err.status = 422;
      err.code = 'invalid_argument';
      break;

    default:
      console.warn('Could not figure out error code from identify error:');
      console.warn(raw);

      if (!messages.length) {
        console.warn('RE_ERROR did not match the error string');
        err = new Error(raw);
      } else {
        err = new Error(messages.shift());
      }

      err.status = 500;
  }

  // Store command used
  err.command = cmd;

  // Store filename
  err.filename = (file || '').trim().replace(/\\/g, '');

  // Store the original error string
  err.raw = raw;

  return err;
};

function toUpper(_, w){
  return w.toUpperCase();
}
