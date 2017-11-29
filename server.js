if (isElectron()) {
  module.exports = require('.')
} else {
  module.exports = function () {}
}

function isElectron () {
  return process && process.versions && (process.versions.electron !== undefined)
}
