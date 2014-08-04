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

var rootIndex = exports.rootIndex = function (length) {
  var i = 1
  length = length - 1
  while(length >>= 1) i <<= 1
  return i
}

var firstChild = exports.firstChild = function (n) {
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

var father = exports.father = function (i, l) {
  var j = belongs(i)
  while(j >= l) j = belongs(j)
  return j
}

function brother (i, j, l) {
  var generation = 1 << (height(j) - 1)
  var other = j < i ? j - generation : j + generation
  while(other >= l) other = firstChild(other)
  return other
}


exports.uncles = function (ary, i) {
  var uncles = []
  var l = ary.length, j
  var root = rootIndex(l)
  while(i !== root) {
    uncles.push(ary[brother(i, j = father(i, l), l)])
    i = j
  }
  return uncles
}

var createHash = require('crypto').createHash

var combine = exports.combine = function (a, b) {
  return createHash('sha256')
    .update(a).update(b)
    .digest().slice(0, 16)
}

exports.recombine = function (uncles, me, i, l) {
  uncles = uncles.slice()
  while(uncles.length) {
    var j = father(i, l)
    me = j > i
      ? combine(me, uncles.shift())
      : combine(uncles.shift(), me)
    i = j
  }
  return me
}

function create () {
  var i = 0, j = 0, l = 0
  var out = []
  return {
    update: function (hash) {
      j = 2 * (i++) + 1
      out[j] = hash
      var parent = belongs(j)
      while(parent < j) {
        //get the younger sibling
        var sibling = parent - (j - parent)
        out[parent] = combine(out[sibling], out[j])
        j = parent; parent = belongs(j)
      }
      return this
    },
    digest: function () {
      var root = rootIndex(out.length)
      while(j !== root) {
        var parent = belongs(j)
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
  }
}

exports.fromArray = function (array) {
  var h = create()
  array.forEach(h.update)
  return h.digest()

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
    var parent = belongs(j)
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

