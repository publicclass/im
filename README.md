# im

The Stream-based [ImageMagick](http://www.imagemagick.org/) wrapper 
for [Node.JS](http://nodejs.org/).

## Install

```bash
$ npm install im
```

## Usage

```javascript
// resize200.js
im(process.stdin)
  .resize('200x200')
  .convert(process.stdout)
```

```bash
$ curl http://placekitten.com/500/500 | node resize200.js
```

## Test

```
$ git clone https://github.com/publicclass/im.git
$ cd im
$ npm i
$ npm test
```

### Licence

(The MIT License)

Copyright (c) 2012 Robert Sköld &lt;robert@publicclass.se&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.