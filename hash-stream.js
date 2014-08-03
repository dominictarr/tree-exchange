
var BlockStream = require('./block-stream')
var u = require('./util')
var crypto = require('crypto')

module.exports = function (opts, onTree) {
  if('function' === typeof opts)
    onTree = opts, opts = {}

  var blklen = opts.blklen || 1024

  var createHash = opts.createHash || function () {
    return crypto.createHash('sha256')
  }
  
  var hashlen = opts.hashlen

  function digest (h) {
    var d = h.digest()
    return (
        hashlen && d.length > hashlen
      ? d.slice(0, hashlen)
      : d
    )
  }

  var ary = []
  var cur = createHash(), m = 0
  var stream = BlockStream(blklen, function (data, n) {
    if(m != n) {
      ary[m] = digest(cur);
      m = n; cur = createHash().update(data)
    }
    else
      cur.update(data)
  }, function () {
    ary[m] = digest(cur)
    this.emit('tree', u.fromArray(ary))
  })

  if(onTree) stream.on('tree', onTree)

  return stream
}


