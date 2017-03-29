'use strict';

Zepto(function ($) {
    var imageLoader = $('#imageLoader');
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');
    var cam;
    imageLoader.on('change', function (e) {
        var reader = new FileReader();
        reader.onload = function (event) {
            var img = new Image();
            img.onload = function () {
                $('#Filters').show();
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.removeAttribute("data-caman-id"); 
                ctx.drawImage(img, 0, 0);
                cam = Caman(canvas);
                 $(".FilterSetting input").each(function () {
                  $(this).val(0);
                  $(this).parent().parent().find(".FilterValue").html(0);
                });
            }
            img.src = event.target.result;
        }
        if(e.target.files.length)
            reader.readAsDataURL(e.target.files[0]);
    });
    var b = {};
  
    function rerender(revert){
        if(revert)
            cam.revert(false);
        $.each(b, function(j,i){ 
            j = b.length - j;
            var k = b[j];
            k = parseFloat(k,10);
            if (k !== 0) {
                cam[j](k);
            }
        });
        cam.render();
    }

    $(".FilterSetting input").each(function () {
        var j;
        j = $(this).data("filter");
        return b[j] = $(this).val()
    });
    $("#Filters").on("change", ".FilterSetting input", function () {
        var j, k;
        j = $(this).data("filter");
        k = $(this).val();
        b[j] = k;
        $(this).parent().parent().find(".FilterValue").html(k);
        rerender(true);
    });
});