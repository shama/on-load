# on-load

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Downloads][downloads-image]][downloads-url]
[![js-standard-style][standard-image]][standard-url]

On load/unload events for DOM elements using a MutationObserver

## usage

```js
var onload = require('on-load')

var div = document.createElement('div')
onload(div, function (el) {
  console.log('in the dom')
}, function (el) {
  console.log('out of the dom')
})

// Will fire the onload
document.body.appendChild(div)

// ... some time later

// Will fire the onunload
document.body.removeChild(div)
```

## API

### `onload(node, onloadFn, onunloadFn, [caller])`

Pass a dom `node` to `onload` to have a `onloadFn` function fire when the dom `node` is added to the document `dom` and a `onunloadFn` fire when the dom `node` is removed from the document `dom`.  Optionally a `caller` ID can be set to associate the onload/onunload hooks with a particular instance of of a dom `node`.  This is commonly used when 'componentizing' dom nodes.

# license
(c) 2018 Kyle Robinson Young. MIT License

[npm-image]: https://img.shields.io/npm/v/on-load.svg?style=flat-square
[npm-url]: https://npmjs.org/package/on-load
[travis-image]: https://img.shields.io/travis/shama/on-load/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/shama/on-load
[downloads-image]: http://img.shields.io/npm/dm/on-load.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/on-load
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
