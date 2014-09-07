(function (window, document) {

    navigator.getUserMedia = navigator.getUserMedia || (navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    document.addEventListener("DOMContentLoaded", function (event) {
        var appURL = document.URL.toString()
//            , serverURL = "ws://" + document.URL.substr(7).split('/')[0]
            , serverURL = "ws://ccx01.sfc.keio.ac.jp:3000"
            , wdc = new WebDisplayConnect.Connection(appURL, serverURL);

        qrcode.callback = function (str) {
            alert(str);
            wdc.reconnect(str, serverURL)
        };

        registerDOMEventListeners(window, document, wdc);
        registerWDCEventListeners(window, document, wdc);
        wdc.open();
    });


    (function () {
        var canvas = document.getElementById("qr-canvas"),
            ctx = canvas.getContext("2d"),
            qrcam = document.getElementById("qrcam"),
            stream;

        function captureToCanvas() {
            if (stream) {
                try {
                    ctx.drawImage(qrcam, 0, 0);
                    qrcode.decode();
                }
                catch (e) {
                    setTimeout(captureToCanvas, 500);
                }
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }

        function stop() {
            if (stream) {
                stream.stop();
                qrcam.src = null;
                stream = null;
            }
        }

        function start() {
            var id = $('input:radio[name=camera]:checked').val();
            stop();
            navigator.getUserMedia({video: {optional: [
                    {sourceId: id}
                ]}},
                function (_stream) {
                    stream = _stream;
                    qrcam.src = window.URL.createObjectURL(stream);
                    setTimeout(captureToCanvas, 500);
                },
                function (e) {
                    console.log(e);
                }
            );
            setTimeout(captureToCanvas, 500);
        }

        $('#qrDecoderModal').on('shown.bs.modal', function () {
            start();
        });

        $('#qrDecoderModal').on('hidden.bs.modal', function () {
            stop();
        });

        MediaStreamTrack.getSources(function (sourceInfos) {
            var i = 0, j = 1;
            for (i = 0; i != sourceInfos.length; ++i) {
                if (sourceInfos[i].kind === 'video') {
                    $("#cameraSelector").append('<label class="btn btn-primary"><input type="radio" name="camera" value="' + sourceInfos[i].id + '">' + 'camera ' + (j++) + '</label>');
                }
            }
            $('input[type=radio]').change(function () {
                start();
            });
        });

    })();


    function registerWDCEventListeners(window, document, wdc) {
        var canvas = document.getElementById("canvas1")
            , ctx = canvas.getContext('2d')

        if (wdc.displayType == "main") {
            document.querySelector("#qr").innerHTML = wdc.generateQR();
            document.querySelector("#uuid").value = location + "#!" + wdc.uuid + '/' + wdc.password;
        } else {
            var subDisplayOnly = document.createElement('button');
            subDisplayOnly.innerHTML = "Sensor"
            subDisplayOnly.id = "subdisplayonly";
            document.body.appendChild(subDisplayOnly);
            document.querySelector('#uuid').innerHTML = "Connected to " + wdc.uuid;
        }

        wdc.on("draw", function (view) {
            var reader = new WebDisplayConnect.ArgmentsReader(view),
                x = reader.readInt32(),
                y = reader.readInt32();

            ctx.beginPath();
            ctx.fillStyle = "#0099ff";
            ctx.arc(x, y, 2, 0, Math.PI * 2, false);
            ctx.fill();
        });

        wdc.on("image", function (view) {
            var reader = new WebDisplayConnect.ArgmentsReader(view),
                width = reader.readInt32(),
                height = reader.readInt32(),
                imageData = ctx.createImageData(width, height),
                i;

            for (i = 0; i < width * height * 4; i++) {
                imageData.data[i] = reader.readUint8();
            }
            ctx.putImageData(imageData, 0, 0);
        });
    }

    function registerDOMEventListeners(window, document, wdc) {
        var canvas = document.getElementById("canvas1")
            , file = document.getElementById("capture1")
            , mouseDown = false

        canvas.addEventListener('mousemove', function (e) {
            var args = new WebDisplayConnect.BinaryArgments(),
                offset = $(canvas).offset();
            if (mouseDown) {
                args.writeName("draw");
                args.writeInt32(e.clientX - offset.left);
                args.writeInt32(e.clientY - offset.top);
                wdc.sendArrayBuffer(args.encode());
            }
        });

        canvas.addEventListener('touchstart', function (e) {
            e.preventDefault();
        });

        canvas.addEventListener('touchmove', function (e) {
            var i, x, y,
                args = new WebDisplayConnect.BinaryArgments(),
                offset = $(canvas).offset();

            for (i = 0; i < e.changedTouches.length; i++) {
                x = e.changedTouches[i].clientX - offset.left;
                y = e.changedTouches[i].clientY - offset.top;
                args.writeName("draw");
                args.writeInt32(x);
                args.writeInt32(y);
                wdc.sendArrayBuffer(args.encode());
            }
        });

        canvas.addEventListener('mousedown', function (e) {
            mouseDown = true;
        });

        canvas.addEventListener('mouseup', function (e) {
            mouseDown = false;
        });

        canvas.addEventListener('mouseout', function (e) {
            mouseDown = false;
        });

        file.addEventListener("change", function (evt) {
            var reader = new FileReader();
            reader.addEventListener('load', function (evt) {
                var img = new Image();
                img.addEventListener('load', function () {
                    var utils = new WebDisplayConnect.ImageUtils(),
                        canvas = utils.createThumbnail(img, 400, 400),
                        imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height),
                        i,
                        args = new WebDisplayConnect.BinaryArgments();

                    args.writeName("image");
                    args.writeInt32(canvas.width);
                    args.writeInt32(canvas.height);
                    for (i = 0; i < imageData.data.length; i++) {
                        args.writeUint8(imageData.data[i]);
                    }
                    wdc.sendArrayBuffer(args.encode());
                });
                img.src = evt.target.result;
            });
            reader.readAsDataURL(evt.target.files[0]);
        });
    }

})(window, document);
