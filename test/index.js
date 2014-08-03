
var crypto = require('crypto')


var BlockStream = require('../block-stream')

var tape = require('tape')

tape('even', function (t) {
  var buffer = crypto.randomBytes(1024)

  var a = []
  var bs = BlockStream(256, function (data, n) {
    if(!a[n]) a[n] = data
    else a[n] = Buffer.concat([a[n], data])
  }, function () {
    t.equal(a.length, 4)
    var actual = crypto.createHash('sha256')
    a.forEach(function (e) {
      t.equal(e.length, 256)
      actual.update(e)
    })
    var expected = crypto.createHash('sha256').update(buffer)
    t.equal(expected.digest('hex'), actual.digest('hex'))
    t.end()
  })

  bs.write(buffer)
  bs.end()

})

tape('odd', function (t) {
  var buffer = crypto.randomBytes(1024)

  var a = []
  var bs = BlockStream(256, function (data, n) {
    if(!a[n]) a[n] = data
    else a[n] = Buffer.concat([a[n], data])
  }, function () {
    console.log(a)
    t.equal(a.length, 4)
    var actual = crypto.createHash('sha256')
    a.forEach(function (e) {
      t.equal(e.length, 256)
      actual.update(e)
    })
    var expected = crypto.createHash('sha256').update(buffer)
    t.equal(expected.digest('hex'), actual.digest('hex'))
    t.end()
  })

  var len = 0
  while(len < buffer.length) {
    var _len = len +
      Math.ceil(Math.random() * (buffer.length - len))
    console.log(len, _len)
    bs.write(buffer.slice(len, _len))
    len = _len
  }
  bs.end()
})

