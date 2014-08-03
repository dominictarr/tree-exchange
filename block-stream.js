var through = require('through')

module.exports = function (blocklen, handler, endHandler) {
  var len = 0, n = 0
  return through(function (data) {
    while(data.length) {
      if(len + data.length < blocklen) {
        len += data.length
        return handler(data, n)
      }

      if(len + data.length === blocklen) {
        len = 0
        return handler(data, n++)
      }

      if(len + data.length > blocklen) {
        var _data = data.slice(0, blocklen - len)
        data = data.slice(blocklen - len)
        len = 0
        //do not return, go around the loop again
        handler(_data, n++)
      }

    }
  }, endHandler)

}
