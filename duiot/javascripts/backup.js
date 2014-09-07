subDisplayOnly.addEventListener("click", function () {
    window.addEventListener('devicemotion', function (e) {
        var buffer = new ArrayBuffer(4 + 8 + 8),
            view = new DataView(buffer);

        view.setInt32(0, 3);
        view.setFloat64(4, e.accelerationIncludingGravity.x);
        view.setFloat64(12, e.accelerationIncludingGravity.y);
        wdc.sendArrayBuffer(buffer);
    });

    var watchPositionHandle = navigator.geolocation.watchPosition(
        function (position) {
            var buffer = new ArrayBuffer(4 + 8 + 8),
                view = new DataView(buffer);

            view.setInt32(0, 4);
            view.setFloat64(4, position.coords.latitude);
            view.setFloat64(12, position.coords.longitude);
            wdc.sendArrayBuffer(buffer);
        },
        function (err) {
            console.log(err);
        }
    );
});


wdc.on("devicemotion", function (view) {
    var x = view.getFloat64(0),
        y = view.getFloat64(8);
    document.getElementById('message').innerHTML = "Devicemotion: " + x + ", " + y;
});

wdc.on("geolocation", function (view) {
    var lat = view.getFloat64(0),
        lng = view.getFloat64(8);
    document.getElementById("gps").innerHTML = "Latitude:" + lat + " Longitude:" + lng;
});

wdc.onRemote("sub", "#subdisplayonly", "click", function (msg) {
    if (wdc.displayType == "main") {
        alert("Client Button was clicked!");
    }
});
