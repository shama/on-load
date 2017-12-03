var window = require('global/window')

if (isElectron()) {
  module.exports = require('./index.js') // explicite relative import to avoid browser field
} else {
  module.exports = function () {}
}

function isElectron () {
  return window && window.process && window.process.type === 'renderer'
}
