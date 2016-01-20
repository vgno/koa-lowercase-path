# koa-lowercase-path

Koa middleware that converts path to lowercase if not already.

[![Build Status](https://img.shields.io/travis/vgno/koa-lowercase-path/master.svg?style=flat-square)](http://travis-ci.org/vgno/koa-lowercase-path) [![Coverage Status](https://img.shields.io/coveralls/vgno/koa-lowercase-path/master.svg?style=flat-square)](https://coveralls.io/r/vgno/koa-lowercase-path) [![npm](https://img.shields.io/npm/v/koa-lowercase-path.svg?style=flat-square)](https://www.npmjs.com/package/koa-lowercase-path)

## Installation
```
npm install koa-lowercase-path
```

## API
```js
var koa = require('koa');
var app = koa();
app.use(require('koa-lowercase-path')(opts));
```

* `opts` options object.

### Options

- `defer` - If true, serves after yield next, allowing any downstream middleware to respond first.
- `chained` - If the middleware should continue modifying the url if it detects that a redirect already have been performed. Defaults to `true`.

## Example
```js
var koa = require('koa');
var lowercasePath = require('koa-lowercase-path');

var app = koa();

app.use(lowercasePath());

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(3000);
```

## Important
Make sure this is added before an eventual [koa-static](https://github.com/koajs/static) middleware to make sure requests to files are not changed and managed correctly. This because it will not rewrite the URL if a `body` has been set along with status `200`.

If all paths always should be rewritten one can set `defer` to `false`.

## License
MIT
