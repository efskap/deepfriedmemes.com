'use strict';

jQuery(function ($) {
    if (! /Mobi/.test(navigator.userAgent)) {
        $('#imageLoader+label').text('Browse (or paste)');
    }
    $('input[type="range"]').rangeslider({polyfill: false});
    
    $('#dl-btn')
        .on('click', function () {
            downloadCanvas(this, 'canvas', 'deepfried_' + Math.floor(Date.now()) + '.png');
        });
    var imageLoader = $('#imageLoader');
    var canvas = $('#canvas')[0];
    var ctx = canvas.getContext('2d');
    var cam;

    var original_img;
    function processLoadedImg(src){
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
            img.src = src;
    }
          
    function loadImage(e) {
        var reader = new FileReader();
        reader.onload = function (event) {
            processLoadedImg(event.target.result);

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
            ctx.drawImage(img, 0, -1); // black line fix... i'm at my wits' end
            ctx.drawImage(img, 0, +1);
            ctx.drawImage(img, 0, 0);
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

   window.addEventListener("paste",processEvent);
 
                function processEvent(e) {
                    for (var i = 0 ; i < e.clipboardData.items.length ; i++) {
 
                        // get the clipboard item
                        var clipboardItem = e.clipboardData.items[i];
                        var type = clipboardItem.type;
 
                        // if it's an image add it to the image field
                        if (type.indexOf("image") != -1) {
 
                            // get the image content and process it
                            var blob = clipboardItem.getAsFile();
                            var blobUrl = window.webkitURL.createObjectURL(blob);
                            processLoadedImg(blobUrl);
                        } else {
                            console.log("Not supported: " + type);
                        }
 
                    }
                }
});

// https://jsfiddle.net/AbdiasSoftware/7PRNN/
function downloadCanvas(link, canvasId, filename) {
    link.href = document
        .getElementById(canvasId)
        .toDataURL();
    link.download = filename;
}

/* Readme file has additional notes */
/* Credits: 
	Joel Besda http://joelb.me/blog/2011/code-snippet-accessing-clipboard-images-with-javascript/
	Rafael http://stackoverflow.com/questions/11850970/javascript-blob-object-to-base64
	Nick et al http://stackoverflow.com/questions/6333814/how-does-the-paste-image-from-clipboard-functionality-work-in-gmail-and-google-c	
*/

(function($) {

	$.pasteimage = function(callback) {
		
		var allowPaste = true;
		var foundImage = false;
		if(typeof(callback) == "function") {
			
			// Patch jQuery to add clipboardData property support in the event object
			$.event.props.push('clipboardData');
			// Add the paste event listener
			$(document).bind("paste", doPaste);

			// If Firefox (doesn't support clipboard object), create DIV to catch pasted image
			if (!window.Clipboard) { // Firefox
				var pasteCatcher = $(document.createElement("div"));
				pasteCatcher.attr("contenteditable","true").css({"position" : "absolute", "left" : "-999", 	width : "0", height : "0", "overflow" : "hidden", outline : 0});
				$(document.body).prepend(pasteCatcher);
			}
		}
		// Handle paste event
		function doPaste(e)  { 

			if(allowPaste == true) {	 // conditionally set allowPaste to false in situations where you want to do regular paste instead
				// Check for event.clipboardData support
				if (e.clipboardData.items) { // Chrome
					// Get the items from the clipboard
					var items = e.clipboardData.items;
					if (items) {
						// Search clipboard items for an image
						for (var i = 0; i < items.length; i++) { // removed: i < items.length, items[i].type.indexOf("image") !== -1
							if (items[i].type.indexOf("image") !== -1) {
								//foundImage = true; Not sure why this was here								
								// Convert image to blob using File API	               
								var blob = items[i].getAsFile();
								var reader = new FileReader();
								reader.onload = function(event){
									callback(event.target.result); //event.target.results contains the base64 code to create the image
								};
								/* Convert the blob from clipboard to base64 */		
								reader.readAsDataURL(blob);
								//foundImage = false; Not sure why this was here
							}
						}
					} else { 
						alert("Nothing found in the clipboard!"); // possibly e.clipboardData undersupported
					}
				} else {
					/* If we can't handle clipboard data directly (Firefox), we need to read what was pasted from the contenteditable element */
					//Since paste event detected, focus on DIV to receive pasted image
					pasteCatcher.get(0).focus();
					foundImage = true;
					// "This is a cheap trick to make sure we read the data AFTER it has been inserted"
					setTimeout(checkInput, 100); // May need to be longer if large image
				}
			}
		}

		/* Parse the input in the paste catcher element */
		function checkInput() {
			// Store the pasted content in a variable
			if(foundImage == true) {
				var child = pasteCatcher.children().last().get(0);
				if (child) {
					// If the user pastes an image, the src attribute will represent the image as a base64 encoded string.
					if (child.tagName === "IMG" && child.src.substr(0, 5) == 'data:') {
						callback(child.src);
						foundImage = false;
					} else { 
						alert("This is not an image!");
					}
					pasteCatcher.html(""); // erase contents of pasteCatcher DIV
				} else { 
					alert("No children found in pastecatcher DIV.");
				}
			} else { 
				alert("No image found in the clipboard!");
			}
		}	
	}
})(jQuery);


