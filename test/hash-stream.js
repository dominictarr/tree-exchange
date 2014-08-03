
var HashTreeStream = require('../hash-stream')

var fs = require('fs')
var u = require('../util')
var BlockReader = require('../block-reader')
var filename = process.argv[2]

var createHash = require('crypto').createHash

fs.createReadStream(filename)
  .pipe(HashTreeStream({blklen: 1024, hashlen: 16},
  function (tree) {
    var br = BlockReader(1024, filename)
    console.log('TREE', tree)
    for(var i = 0; i < (tree.length / 2); i++) (function (i) {
      br.read(i, function (err, data) {
        var j = i*2 + 1
        var uncles = u.uncles(tree, j)
        console.log([i, uncles, data])
        var h = createHash('sha256')
          .update(data).digest().slice(0, 16)
        var root = u.recombine(uncles, h, i*2 + 1)
        console.log('ROOT', root)
      })
    })(i)
  }))
