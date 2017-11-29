if (isElectron()) {
  module.exports = require('.')
} else {
  module.exports = function () {}
}

function isElectron () {
  return typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer'
}
