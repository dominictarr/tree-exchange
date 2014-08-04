'use strict';

//count the factors of two in this number.
var height = exports.height = function (n) {
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
  var d = 1 << (height(n) - 1)
  return [n - d, n + d]
}

exports.firstChild = function (n) {
  if(n%2) return n
  var d = 1 << (height(n) - 1)
  return n - d
}

var belongs = exports.belongs = function (n) {
  n = +n
  var d = 1 << height(n)
  //handle powers of 2
  if(n - d === 0) return n << 1
  return height(n - d) < height(n + d) ? n - d : n + d
}

var createHash = require('crypto').createHash

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

      out[parent] = combine(out[sibling], out[j])
    }
    j = parent
  }

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

    //append the *other* hash, so that a recepient can
    //verify that the sent data forms the root hash.
    var removes =  1 << (height(j) - 1)

    var brother = //j - -(j - i)
      j < i ? j - removes : j + removes

    while(brother >= ary.length) {
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

