(function (window) {
    var root = this,
        WebDisplayConnect = root.WebDisplayConnect = {},
        proto = {};

    WebDisplayConnect.VERSION = 0.1;

    function createPrototype(WebDisplayConnect, proto) {
        var i;
        for (i in proto) {
            WebDisplayConnect[i] = proto[i].constructor;
            WebDisplayConnect[i].getPrototype = (function (name) {
                return function () {
                    return proto[name];
                };
            })(i);
        }
    }

    proto.ArgmentsReader = Object.create(Object.prototype, {
        constructor: {
            value: function (view) {
                var o = Object.create(proto.ArgmentsReader);
                o.view = view;
                o.index = 0;
                return o;
            }
        },

        readInt8: {
            value: function () {
                var value = this.view.getInt8(this.index);
                this.index = this.index + 1;
                return value;
            }
        },

        readUint8: {
            value: function (value) {
                var value = this.view.getUint8(this.index);
                this.index = this.index + 1;
                return value;
            }
        },

        readInt16: {
            value: function (value) {
                var value = this.view.getInt16(this.index);
                this.index = this.index + 2;
                return value;
            }
        },

        readUint16: {
            value: function (value) {
                var value = this.view.getUint16(this.index);
                this.index = this.index + 2;
                return value;
            }
        },

        readInt32: {
            value: function (value) {
                var value = this.view.getInt32(this.index);
                this.index = this.index + 4;
                return value;
            }
        },

        readUint32: {
            value: function (value) {
                var value = this.view.getUint32(this.index);
                this.index = this.index + 4;
                return value;
            }
        },

        readFloat32: {
            value: function (value) {
                var value = this.view.getFloat32(this.index);
                this.index = this.index + 4;
                return value;
            }
        },

        readFloat64: {
            value: function (value) {
                var value = this.view.getFloat64(this.index);
                this.index = this.index + 8;
                return value;
            }
        }
    });


    proto.BinaryArgments = Object.create(Object.prototype, {
        constructor: {
            value: function () {
                var o = Object.create(proto.BinaryArgments);
                o.buffer = [];
                o.size = 0;
                return o;
            }
        },

        stringToUnicodeBytes: {
            value: function (str) {
                var buff = [],
                    i;
                for (i = 0; i < str.length; i++) {
                    buff.push(str.charCodeAt(i));
                }
                return buff;
            }
        },

        unicodeBytesToString: {
            value: function (bytes) {
                var buff = [],
                    i;
                for (i = 0; i < bytes.length; i++) {
                    buff.push(String.fromCharCode(bytes[i]));
                }
                return buff.join("");
            }
        },

        encode: {
            value: function () {

                while (this.size % 16 != 0) {
                    this.writeInt8(0);
                }

                var index = 0,
                    arraybuffer = new ArrayBuffer(this.size),
                    view = new DataView(arraybuffer);


                this.buffer.forEach(function (entry) {
                    switch (entry.type) {
                        case 'utf8array':
                            entry.value.forEach(function (c) {
                                view.setInt8(index, c);
                                index += 1;
                            });
                            break;
                        case 'int8':
                            view.setInt8(index, entry.value);
                            index += 1;
                            break;
                        case 'uint8':
                            view.setUint8(index, entry.value);
                            index += 1;
                            break;
                        case 'int16':
                            view.setInt16(index, entry.value);
                            index += 2;
                            break;
                        case 'uint16':
                            view.setUint16(index, entry.value);
                            index += 2;
                            break;
                        case 'int32':
                            view.setInt32(index, entry.value);
                            index += 4;
                            break;
                        case 'uint32':
                            view.setUint32(index, entry.value);
                            index += 4;
                            break;
                        case 'float32':
                            view.setFloat32(index, entry.value);
                            index += 4;
                            break;
                        case 'float64':
                            view.setInt64(index, entry.value);
                            index += 8;
                            break;
                    }
                });

                return arraybuffer;
            }
        },


        writeName: {
            value: function (value) {
                var bytes = this.stringToUnicodeBytes(value);
                this.buffer.push({type: "int8", value: bytes.length});
                this.buffer.push({type: "utf8array", value: bytes});
                this.size = 1 + bytes.length;
            }
        },

        writeInt8: {
            value: function (value) {
                this.buffer.push({type: "int8", value: value});
                this.size = this.size + 1;
            }
        },

        writeUint8: {
            value: function (value) {
                this.buffer.push({type: "uint8", value: value});
                this.size = this.size + 1;
            }
        },

        writeInt16: {
            value: function (value) {
                this.buffer.push({type: "int16", value: value});
                this.size = this.size + 2;
            }
        },

        writeUint16: {
            value: function (value) {
                this.buffer.push({type: "uint16", value: value});
                this.size = this.size + 2;
            }
        },

        writeInt32: {
            value: function (value) {
                this.buffer.push({type: "int32", value: value});
                this.size = this.size + 4;
            }
        },

        writeUint32: {
            value: function (value) {
                this.buffer.push({type: "uint32", value: value});
                this.size = this.size + 4;
            }
        },

        writeFloat32: {
            value: function (value) {
                this.buffer.push({type: "float32", value: value});
                this.size = this.size + 4;
            }
        },

        writeFloat64: {
            value: function (value) {
                this.buffer.push({type: "float64", value: value});
                this.size = this.size + 8;
            }
        },

        toString: {
            value: function () {
                return this.buffer.join();
            }
        }
    });


    proto.StringBuffer = Object.create(Object.prototype, {
        constructor: {
            value: function () {
                var o = Object.create(proto.StringBuffer);
                o.buffer = [];
                o.index = 0;
                return o;
            }
        },

        append: {
            value: function (s) {
                this.buffer[this.index] = s;
                this.index += 1;
                return this;
            }
        },

        toString: {
            value: function () {
                return this.buffer.join();
            }
        }
    });


    proto.ImageUtils = Object.create(Object.prototype, {
        constructor: {
            value: function () {
                var o = Object.create(proto.ImageUtils);
                return o;
            }
        },

        createThumbnail: {
            value: function (image, maxWidth, maxHeight) {
                var width = image.width,
                    height = image.height,
                    canvas, context;

                maxWidth = maxWidth || 0;
                maxHeight = maxHeight || 0;
                maxWidth = maxWidth > image.width ? image.width : maxWidth;
                maxHeight = maxHeight > image.height ? image.height : maxHeight;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }

                var canvas = document.createElement('canvas');
                context = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;
                context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
                return canvas;
            }
        }
    });


    proto.Connection = Object.create(Object.prototype, {
        constructor: {
            value: function (appURL, serverURL) {
                var o = Object.create(proto.Connection),
                    regex = /#!(.+)\/(.+)/g,
                    elems = regex.exec(appURL);

                o.enableEncryption = false;
                o.serverURL = serverURL;
                o.isOpen = false;
                o.sendingBuffer = [];
                o.commands = {};
                if (elems) {
                    o.uuid = elems[1];
                    o.password = elems[2];
                    o.displayType = "sub";
                    history.pushState({}, null, "/");
                } else {
                    o.url = appURL;
                    o.uuid = UUID.generate();
                    o.password = UUID.generate();
                    o.displayType = "main";
                }

                o.commands.listeningRequest = function (msg) {
                    if (msg.displayType == o.displayType) {
                        console.log(msg);
                        var list = document.querySelectorAll(msg.selector),
                            i, len;
                        for (i = 0, len = list.length; i < len; i++) {
                            list[i].addEventListener(msg.event, function (event) {
                                event.command = msg.id;
                                o.ws.send(JSON.stringify({command: msg.id}));
                            });
                        }
                    }
                };

                return o;
            }
        },

        reconnect: {
            value: function (appURL, serverURL) {
                var regex = /#!(.+)\/(.+)/g,
                    elems = regex.exec(appURL),
                    that = this;

                this.enableEncryption = false;
                this.serverURL = serverURL;
                this.isOpen = false;
                this.sendingBuffer = [];
                this.uuid = elems[1];
                this.password = elems[2];
                this.displayType = "sub";

                this.commands.listeningRequest = function (msg) {
                    if (msg.displayType == o.displayType) {
                        console.log(msg);
                        var list = document.querySelectorAll(msg.selector),
                            i, len;
                        for (i = 0, len = list.length; i < len; i++) {
                            list[i].addEventListener(msg.event, function (event) {
                                event.command = msg.id;
                                that.ws.send(JSON.stringify({command: msg.id}));
                            });
                        }
                    }
                };

                this.close();
                this.open();
            }
        },

        generateQR: {
            value: function () {
                var qr = qrcode_gen(7, 'M');
                qr.addData(this.url + "#!" + this.uuid + '/' + this.password);
                qr.make();
                return qr.createImgTag();
            }
        },

        open: {
            value: function () {
                this.ws = new WebSocket(this.serverURL);
                this.ws.binaryType = 'arraybuffer';
                this.ws.addEventListener("message", this.onMessage.bind(this));
                this.ws.addEventListener("open", this.onOpen.bind(this));
                this.ws.addEventListener("close", this.onClose.bind(this));
                this.ws.addEventListener("error", this.onError.bind(this));
            }
        },

        close: {
            value: function () {
                this.ws.close();
            }
        },

        encrypt: {
            value: function (input, callback) {
            }
        },

        decrypt: {
            value: function (input, callback) {
            }
        },

        sendArrayBuffer: {
            value: function (buffer) {
                try {
                    this.sendingBuffer.forEach(function (b) {
                        this.ws.send(b);
                    }.bind(this));
                    this.sendingBuffer = [];
                    if (this.enableEncryption) {
                        this.ws.send(buffer);
                    } else {
                        this.ws.send(buffer);
                    }
                } catch (e) {
                    this.sendingBuffer.push(buffer);
                    console.log(e.message);
                }
            }
        },

        sendJSON: {
            value: function (obj) {
                this.ws.send(JSON.stringify(obj));
            }
        },

        onRemote: {
            value: function (displayType, selector, event, fn) {
                var id;
                while (id && this.commands[id]) {
                    id = Math.floor(Math.random() * 4294967294);
                }
                this.commands[id] = fn;
                var msg = {
                    command: 'listeningRequest',
                    displayType: displayType,
                    selector: selector,
                    event: event,
                    id: id
                };
                if (this.isOpen) {
                    this.ws.send(JSON.stringify(msg));
                } else {
                    this.sendingBuffer.push(JSON.stringify(msg));
                }
            }
        },

        on: {
            value: function (command, fn) {
                this.commands[command] = fn;
            }
        },

        onMessage: {
            value: function (event) {
                if ((typeof event.data) == "string") {
                    var msg = JSON.parse(event.data);
                    this.commands[msg.command](msg);
                } else if (event.data instanceof ArrayBuffer) {
                    var view,
                        length,
                        i,
                        funcname,
                        bytes = [],
                        buff = [];

                    if (this.enableEncryption) {
                        view = new DataView(event.data);
                    } else {
                        view = new DataView(event.data);
                    }
                    length = view.getInt8(0);
                    for (i = 1; i < length + 1; i++) {
                        bytes.push(view.getInt8(i));
                    }
                    for (i = 0; i < bytes.length; i++) {
                        buff.push(String.fromCharCode(bytes[i]));
                    }
                    funcname = buff.join("");
                    view = new DataView(event.data, length + 1);
                    this.commands[funcname](view);
                } else {
                    throw new TypeError(event.data + " is not an ArrayBuffer.");
                }
            }
        },

        onOpen: {
            value: function (event) {
                console.log("connected");
                this.isOpen = true;
                this.ws.send(JSON.stringify({command: 'connect', session: this.uuid}));
                this.sendingBuffer.forEach(function (msg) {
                    this.ws.send(msg);
                }.bind(this));
                this.sendingBuffer = [];
            }
        },

        onClose: {
            value: function (event) {
                console.log(event);
            }
        },

        onError: {
            value: function (event) {
                console.log(event);
            }
        }
    });

    createPrototype(WebDisplayConnect, proto);
})(window);
