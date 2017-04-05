'use strict';

jQuery(function ($) {
    //if (/Mobi/.test(navigator.userAgent)) {
    if (true) {
        $('input[type="range"]').rangeslider({polyfill: false});
    }
    $('#dl-btn')
        .on('click', function () {
            downloadCanvas(this, 'canvas', 'deepfried_' + Math.floor(Date.now()) + '.png');
        });
    var imageLoader = $('#imageLoader');
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');
    var cam;

    var original_img;

    function loadImage(e) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.removeAttribute("data-caman-id");
                ctx.drawImage(img, 0, 0);
                original_img = canvas.toDataURL();
                $('#Filters').show();
                $(".slider input").each(function () {

                    $(this)
                        .parent()
                        .parent()
                        .find(".FilterValue")
                        .html($(this).val());
                });
                cam = Caman(canvas, function(){ rerender(true)});
               
            };
            img.src = event.target.result;

        }
        if (e.target.files.length) 
            reader.readAsDataURL(imageLoader[0].files[0]);
        }
    
    imageLoader.on('change', loadImage);

    var b = {};
    var apply_filters = function (callback) {
        $('#statustext')
            .html('<i class="em em-art"></i>&nbsp; applying filters')
            .promise()
            .done(function () {
                cam.reloadCanvasData();
                $.each(b, function (j, i) {
                    var k = b[j];
                    k = parseFloat(k, 10);
                    if (k !== 0) {
                        cam[j](k);
                    }
                });
                cam.render(callback);
            });

    };
    var rerender = function (revert) {
        $('#canvas').toggleClass('proc', true);
        $('#dl-btn').css({'visibility': 'hidden'});
        if ( ! ($('#jpeg-before').is(':checked') || $('#jpeg-after').is(':checked'))){
            $('#jpeg_opts').hide();
        }
        else
            $('#jpeg_opts').show();
        var n = parseInt($('#jpeg_times').val());
        var i = 0; // iterator
        var jpeg_quality = parseFloat($('#jpeg_quality').val());

        $('#jpeg_quality')
            .parent()
            .parent()
            .toggleClass('faded', jpeg_times === 0);
        var img = new Image();
        var run = 0;
        var jpegize_inner = function () {
            //4. draw the original image on the canvas
            ctx.drawImage(img, 0, 0);
            console.log(i);
            if (i > 0) {
                $('#statustext').html('<i class="em em-sparkles"></i>&nbsp; JPEGing - ' + (n - i) + '/' + n);
                i--;
                img.src = canvas.toDataURL("image/jpeg", Math.max(0, jpeg_quality + Math.sin(i) * 0.05 - 0.025));
            } else {
                if (run == 0) // done jpeging first time, time to do filters
                    apply_filters(function () {
                        run += 1;
                        jpegize();
                    });
                else {
                    // done jpeging second time
                    $('#statustext').html('<i class="em em-ok_hand"></i>');
                    $('#canvas').toggleClass('proc', false);
                    $('#dl-btn').css({'visibility': 'visible'});
                }
            }
        };
        var jpegize = function () {
            // 2. image is loaded.
            // 3. reset iterator variable if this run is chosen
            if ((run == 0 && $('#jpeg-before').is(':checked')) || (run == 1 && $('#jpeg-after').is(':checked'))) 
                i = n;
            else // or set 0 iterations otherwise
                i = 0;
            img.onload = jpegize_inner;
            if (run > 0)
                img.src = canvas.toDataURL();
            else
                jpegize_inner();
        };
        img.onload = jpegize;
        // 1. image is set to load
        img.src = original_img;

    };
    $(".FilterSetting input").each(function () {
        var j;
        j = $(this).data("filter");
        return b[j] = $(this).val()
    });
    $("#Filters").on("change", ".togglegroup input", function () {
        rerender(true);

    });
    $("#Filters").on("change", ".slider input", function () {
        var j,
            k;
        j = $(this).data("filter");
        k = $(this).val();
        if (j) 
            b[j] = k;
        $(this)
            .parent()
            .parent()
            .find(".FilterValue")
            .html(k);
        rerender(true);
    });
});

// https://jsfiddle.net/AbdiasSoftware/7PRNN/
function downloadCanvas(link, canvasId, filename) {
    link.href = document
        .getElementById(canvasId)
        .toDataURL();
    link.download = filename;
}