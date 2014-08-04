var tape = require('tape')

var u = require('../util.js')

var spaces = '                                   '

function dumpTree (tree) {
  var d = 1
  var l = tree.length
  while(l >>= 1) d++

  for(var i = 1; i < tree.length; i++) {
    var n = i, e = 1
    while(n && !(n & 1)) {
      n >>= 1
      e ++
    }
    console.log(
      spaces.substring(0, 2 - i.toString().length) + i,
      spaces.substring(0, (d - e)*2) +
      (tree[i] ? tree[i].toString('hex') : '?')
    )
  }
}

tape('simple', function (t) {

  var height = {
    0: [1, 3, 5, 7, 9, 11, 13, 15],
    1: [  2,    6,    10,     14],
    2: [     4,           12],
    3: [           8],
  }

  //[[2, [5, _]], 12]


  for(var i = 1; i < 16; i++) {
    var d = u.height(i)
    t.ok(~height[d].indexOf(i))
  }

  t.end()
})

tape('parts', function (t) {

  var parts = {
     2: [1,3],
     4: [2, 6],
     6: [5,7],
     8: [4, 12],
    10: [9, 11],
    12: [10, 14],
    14: [13, 15]
  }

  for(var i = 1; i < 16; i++)
    if(i % 2) t.deepEqual(u.parts(i), [i])
    else      t.deepEqual(u.parts(i), parts[i])

  t.end()

})

tape('belongs', function (t) {

  var belongs = {
     1: 2,
     2:   4,
     3: 2,
     4:     8,
     5: 6,
     6:   4,
     7: 6,
     8:       16,
     9: 10,
    10:   12,
    11: 10,
    12:     8,
    13: 14,
    14:   12,
    15: 14
  }

  for(var i = 1; i < 16; i++)
    t.equal(u.belongs(i), belongs[i])

  t.end()

})

var createHash = require('crypto').createHash
function sha256_10 (n) {
  return createHash('sha256').update('' + n).digest().slice(0, 16)
}

function genHashArray (l) {
  var a = []
  while(l--) {
    a.push(sha256_10(l))
  }
  return a
}

tape('fromArray', function (t) {
  var array = genHashArray(16)
  console.log(array)
  var tree = u.fromArray(array)
  console.log(tree)
  //okay so what hashes are needed to check a value?
  //you need your sibling + your ancestor's siblings.

  for(var i = 0; i < tree.length; i++)
    if(i % 2) {
      var h = u.uncles(tree, i)
      var root = u.recombine(h, tree[i], i)
      console.log([h, tree[i], i])
      console.log(h, root)
      t.deepEqual(tree[16], root)
    }
  dumpTree(tree)
  t.end()
})

for(var i = 1; i <= 16; i++) (function (i) {
  tape('fromArray - all sizes', function (t) {
    var array = genHashArray(i)
    var tree = u.fromArray(array)
    dumpTree(tree)
    console.log('root', u.rootIndex(tree.length))
    for(var j = 0; j < tree.length; j++) {
      if(j % 2) {
        var h = u.uncles(tree, j)
        console.log('uncles', h, tree[j], j)
        var root = u.recombine(h, tree[j], j, tree.length)
        console.log('root:', u.rootIndex(tree.length), root)
        t.deepEqual(root, tree[u.rootIndex(tree.length)])
      }
    }
    t.end()
  })
})(i)

tape('test combine', function (t) {
  var h = u.combine(
    new Buffer('af1edfd4cff844fe861aa173cd2a56ba', 'hex'),
    new Buffer('5feceb66ffc86f38d952786c6d696c79', 'hex')
  )
  t.deepEqual(h,
    new Buffer('28458cd394988767d749a985ccab79b2', 'hex')
  )
  console.log('combine', h)
  t.end()


})
