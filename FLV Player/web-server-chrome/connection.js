(function() {
    function HTTPConnection(stream) {
        this.stream = stream
        this.curRequest = null
        this.onRequestCallback = null
        this.closed = false
    }
    HTTPConnection.prototype = {
        log: function(msg) {},
        tryRead: function() {
            this.stream.readUntil('\r\n\r\n',this.onHeaders.bind(this))
        },
        write: function(data) {
            if (typeof data == 'string') {
                var buf = stringToUint8Array(data).buffer
            } else {
                var buf = data
            }
            this.stream.writeBuffer.add(buf)
            this.stream.tryWrite()
        },
        close: function() {
            this.closed = true
            this.stream.close()
        },
        addRequestCallback: function(cb) {
            this.onRequestCallback = cb 
        },
        onHeaders: function(data) {
            var datastr = arrayBufferToString(data)
            var lines = datastr.split('\r\n')
            var firstline = lines[0]
            var flparts = firstline.split(' ')
            var method = flparts[0]
            var uri = flparts[1]
            var version = flparts[2]
            var headers = parseHeaders(lines.slice(1,lines.length-2))
            this.curRequest = new Request({headers:headers,
                                           method:method,
                                           uri:uri,
                                           version:version,
                                           connection:this})
            if (headers['Content-Length']) {
                var clen = parseInt(headers['Content-Length'])
                this.stream.readBytes(clen, this.onRequest)
            } else if (method == 'GET') {
                this.onRequest(this.curRequest)
            } else if (method == 'HEAD') {
                this.onRequest(this.curRequest)
            }
        },
        onRequest: function(request) {
            this.onRequestCallback(request)
        }
    }
    window.HTTPConnection = HTTPConnection;
})()
