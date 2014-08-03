
var fs = require('fs')
var EventEmitter = require('events').EventEmitter

module.exports = function (blklen, filename) {
  var emitter = new EventEmitter ()

  var fd

  fs.open(filename, 'r', function (err, _fd) {
    fd = _fd
    if(err) emitter.emit('error', err)
    else    emitter.emit('open', _fd)
  })


  emitter.read = function (n, cb) {
    if(!fd)
      return emitter.once('open', function () {
        emitter.read(n, cb)
      })

    fs.read(fd, new Buffer(blklen), 0, blklen, blklen*n,
      function (err, bytes, data) {
        if(bytes < data.length)
          data = data.slice(0, bytes)
        cb(err, data)
      })
  }

  emitter.close = function (cb) {
    if(!fd)
      emitter.on('open', function () {fs.close(fd, cb)})
    else
      fs.close(fd, cb)
  }

  return emitter
}
