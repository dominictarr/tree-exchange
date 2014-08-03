'use strict';

//count the factors of two in this number.
var depth = exports.depth = function (n) {
  var f = 0
  while(!(n & 1)) {
    f++; n = n >> 1
  }
  return f
}

//find the children of a given number.
//(note: only even numbers have children,
//and children are always have less factors of 2)
exports.parts = function (n) {
  if(n%2) return [n]
  var d = 1 << (depth(n) - 1)
  return [n - d, n + d]
}

exports.firstChild = function (n) {
  if(n%2) return n
  var d = 1 << (depth(n) - 1)
  return n - d
}

var belongs = exports.belongs = function (n) {
  n = +n
  var d = 1 << depth(n)
  //handle powers of 2
  if(n - d === 0) return n << 1
  return depth(n - d) < depth (n + d) ? n - d : n + d
}

var createHash = require('crypto').createHash

function XOR (a, b) {
  var l = Math.max(a.length, b.length)
  var c = new Buffer(l)
  for(var i = 0; i < l; i ++)
    c[i] = (a[i] | 0) ^ (b[i] | 0)
  return c
}

var combine = exports.combine = function (a, b) {
  return createHash('sha256')
    .update(a).update(b)
    .digest().slice(0, 16)
}

exports.fromArray = function (array) {
  var length = array.length
  var out = new Array(length * 2 - 1)
  var parent, j
  var root = rootIndex(out.length)

  for(var i = 0; i < array.length; i++) {
    j = 2 * i + 1 //convert index to odd number
    out[j] = array[i]
    parent = belongs(j)
    while(parent < j) {
      //get the younger sibling
      var sibling = parent - (j - parent)
      out[parent] = combine(out[sibling], out[j])
      j = parent; parent = belongs(j)
    }
  }

  while(j !== root) {
    var parent = j
    parent = belongs(j)
    if(parent < out.length) {
      var sibling = parent - (j - parent)

      //if the dad is not in the alive,
      //the oldest son becomes head of the family.
      while(j >= out.length)
        j = exports.firstChild(j)

      console.log('>', parent, sibling, j)

      out[parent] = combine(out[sibling], out[j])
    }
    j = parent
  }
  console.log('root j', j)
  return out
}

exports.uncles = function (ary, i) {
  var uncles = []
  var root = rootIndex(ary.length)
  while(true) {
    if(i === root) return uncles
    var j = belongs(i)
    var brother
    while(j >= ary.length) {
      j = belongs(j)
    }
//    console.log('belongs', i, 'to', j)
    //append the *other* hash, so that a recepient can
    //verify that the sent data forms the root hash.
    var removes =  1 << (depth(j) - 1)

    var brother = //j - -(j - i)
      j < i ? j - removes : j + removes

    while(brother >= ary.length) {
//      console.log('bro', brother)
      brother = exports.firstChild(brother)
    }
    uncles.push(ary[brother])
    i = j
  }
}

exports.recombine = function (uncles, me, i, l) {
  uncles = uncles.slice()
  while(uncles.length) {
    var j = belongs(i)
    while(l && j >= l) j = belongs(j)
//    console.log('recombine', l, i, j, i > j ? 'me,you':'you,me')
//    console.log(
//      j > i
//    ? [me.toString('hex'), uncles[0].toString('hex')]
//    :  [uncles[0].toString('hex'), me.toString('hex')]
//    )
//
    me = j > i
      ? combine(me, uncles.shift())
      : combine(uncles.shift(), me)
    i = j
  }
  return me
}

var rootIndex = exports.rootIndex = function (length) {
  var i = 1
  length = length - 1
  while(length >>= 1) i <<= 1
  return i
}

