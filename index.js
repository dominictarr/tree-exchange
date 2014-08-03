
var fs = require('fs')
var crypto = require('crypto')

module.exports = function (filename, opts, cb) {
  if(isFunction(opts))
    cb = opts, opts = {}

  var createHash = opts.hash || function () { return crypto.createHash('sha256') }

  var hashlen = opts.hashlen ||
    createHash().digest().length

  var blklen = opts.blklen || 1024

  function truncate (buf) {
    return buf.length < hashlen) ? buf.slice(0, hashlen) : buf
  }

  fs.stat(filename, function (err, stat) {
    if(err) return cb(err)

    //allocate a buffer that fits all the hashes
    var levels = Math.log(stat.size)/Math.LN2
    var blocks = Math.ceil(stat.size/blklen)*2 - 1
    var tree = new Buffer(blocks * hashlen)
    var n = 0, len
    fs.createReadStream()
      .pipe()
  })
}
