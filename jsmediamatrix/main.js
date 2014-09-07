(function (){
    
    function loadImage(file, callback) {
        var reader = new FileReader();
        reader.onerror = function(evt){
            console.log(evt.target.error.code + " " + file.name);
        };
        reader.onload = function(evt) {
            var img = new Image();
            img.src = evt.target.result;
            img.onload = function() {
                callback(img);
            };
        };
        reader.readAsDataURL(file);
    }


    function createThumbnail(image, maxWidth, maxHeight) {
        maxWidth = maxWidth || 0;
        maxHeight = maxHeight || 0;
        
        var width = image.width,
        height = image.height,
        offsetX = 0,
        offsetY = 0,
        canvas = null,
        context = null,
        length = null;

        maxWidth = maxWidth > image.width ? image.width : maxWidth;
        maxHeight = maxHeight > image.height ? image.height : maxHeight;
 
        if(width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
        } 
        if(height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
        }
 
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;
        context.drawImage(image, offsetX, offsetY, length || image.width, length || image.height, 0, 0, canvas.width, canvas.height);
        return canvas;
    }

    function analyzeImage(bitmap, colors, callback) {    
        var worker = Object.create(MediaMatrix.worker.WorkerObject);
        worker.method = "analyze";
        worker.args = {
            colors: colors, 
            bitmap: bitmap
        };
        worker.onmessage =  function(event) {
            callback(event.data);
        };
        worker.onerror = function(error) {
            console.log(error);                 
        };
        worker.start();
    }


    function analyzeImageImpression(bitmap, space, callback) {    
        var worker = Object.create(MediaMatrix.worker.WorkerObject);
        worker.method = "analyzeImpression";
        worker.args = {
            space: space, 
            bitmap: bitmap
        };
        worker.onmessage =  function(event) {
            callback(event.data);
        };
        worker.onerror = function(error) {
            console.log(error);                 
        };
        worker.start();
    }


    $(function(){
        
        $('#home').live('pageshow',function(event){
            $('a[data-icon="home"]').addClass("ui-btn-active");
            $('a[data-icon="search"]').removeClass("ui-btn-active");
        });
            
        $('#library').live('pageshow',function(event){
            $('a[data-icon="home"]').removeClass("ui-btn-active");
            $('a[data-icon="search"]').addClass("ui-btn-active");
        });
        
        $("#dummyButton").click(function(){
            $("#imageFile").get(0).click();
        });
        
        $("#imageFile").change(function() {
            var fileList = document.getElementById("imageFile").files,
            file = fileList[0],
            spinOpts = {
                lines: 12, // The number of lines to draw
                length: 7, // The length of each line
                width: 4, // The line thickness
                radius: 10, // The radius of the inner circle
                color: '#000', // #rgb or #rrggbb
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                shadow: false // Whether to render a shadow
            };

            new Spinner(spinOpts).spin(document.getElementById("spin"));

            loadImage(file, function(img){
                var canvas = createThumbnail(img, 400, 400);
                var context = canvas.getContext('2d');
                var bitmap;                
                if ($('#focus option:selected').val() == 'on') {
                    bitmap = context.getImageData(200, 100, 100, 200);
                } else {
                    bitmap = context.getImageData(0, 0, canvas.width, canvas.height);                    
                }
                var space = $("input[name=culture]:checked").val();
                var colorImpression = Object.create(MediaMatrix.core.ColorImpression);
                colorImpression.predefined(space);

                analyzeImageImpression(bitmap, space, function(result){
                    var i, ul, li, img;
                    $("#spin").empty();
                    $("#spin").html("<br/><br/><br/>");
                    $("#result_content").empty();
                    document.getElementById("result_content").appendChild(canvas);
                    ul = $('<ul data-role="listview" data-inset="true" data-theme="c" data-dividertheme="b"></ul>');
                    for (i = 0; i < 5; i++) {
                        li = $("<li></li>");
                        img = $("<img></img>");
                        img.attr("src", colorImpression.toImage(result[i].name));
                        li.text(result[i].name + "  :  " + result[i].score);
                        li.append(img);
                        ul.append(li);
                    }
                    $("#result_content").append(ul);
                    ul.listview();
                });
            });
        });
    });
})();

