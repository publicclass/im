
0.4.0 / 2015-05-05
==================

  * Added original tests for ident
  * Fixed ident to parse properly according to fixtures (breaking change)

0.3.1 / 2015-05-04
==================

  * Added travis tests
  * Parse the error message from ImageMagick#convert()
  * Added error code for failed input streams
  * Added identify to the exports.commands
  * Fixed the paths and URLs in the http tests


0.3.0 / 2015-05-04
==================

  * Added ImageMagick#interlace(). To be able to make progressive jpegs/
  * Added ImageMagick#identify()


0.2.3 / 2012-06-19
==================

  * Fixed `ImageMagick#coalesce()`, boolean commands don't need any arguments.


0.2.2 / 2012-06-14
==================

  * Added `ImageMagick#layers()`.
  * Added `ImageMagick#coalesce()`.


0.2.1 / 2012-05-29
==================

  * Added `ImageMagick#define()`.
  * Asserts that the `ImageMagick#quality()`-argument is a number.

0.2.0 / 2012-03-19
==================

  * Added `ImageMagick#autoOrient()`.
  * Added `ImageMagick#extent()`.
  * Added `ImageMagick#filter()`.
  * Added `ImageMagick#gravity()`.
  * Added `ImageMagick#liquidRescale()`.
  * Added `ImageMagick#quality()`.
  * Added `ImageMagick#rotate()`.
  * Added `ImageMagick#sample()`.
  * Added `ImageMagick#scale()`.
  * Added `ImageMagick#sharpen()`.
  * Added `ImageMagick#strip()`.
  * Added `ImageMagick#thumbnail()`.
  * Added `ImageMagick#unsharp()`.

0.1.1 / 2012-02-29
==================

  * Added `ImageMagick#format()`.
  * Loosened node engine dependency.
  * Using [slaskis knox fork](https://github.com/slaskis/knox) instead to get
    the streaming to work more reliably.

0.1.0 / 2012-02-29
==================

  * Initial release
