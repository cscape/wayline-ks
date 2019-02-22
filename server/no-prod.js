const crypto = require('crypto')

// generates strings like 'b1bb3f75af/9/61/54a/5/540/dd58'
const path = () => '/api/' + crypto
  .randomBytes(24)
  .toString('hex') // gen random hex string
  .split('')
  .map(s => Math.random() < 0.2 ? s + '/' : s) // randomly add slashes
  .join('')
  .split('/')
  .filter(a => a !== '').join('/') // remove last slash

module.exports = path()
