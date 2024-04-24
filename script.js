$( function() {
	// //values pulled from query string
	// $('#model').val("anemia-detection-yciqn");
	// $('#version').val("1");
	// $('#api_key').val("TYdlyjQygqI06Eledacx");

	setupButtonListeners();
});

var infer = function() {
	$('#load').show();
	$('#output').html("");
	
	$("#resultContainer").show();
	
	$('html').scrollTop(10000);

	getSettingsFromForm(function(settings) {
		settings.error = function(xhr) {
			// $('#output').html("").append([
			// 	"Error loading response.",
			// 	"",
				
			// 	"Try again later."
			// ].join("\n"));

			$('#output').html("Error loading response.<br><br>Try again later.");
            // Hide loading GIF on error
            $('#load').hide();

			
		};

		// $.ajax(settings).then(function(response) {
		// 	var pretty = $('<pre>');
		// 	var formatted = JSON.stringify(response, null, 4)

		// 	pretty.html(formatted);
		// 	$('#output').html("").append(pretty);
		// 	$('html').scrollTop(100000);
		// });


        $.ajax(settings).then(function(response) {
            // This is where you handle the response from the API
            // Extract confidence level of "anemia" prediction from the response
            var result = response.predictions.anemia.confidence;
        
            // Define confidence threshold for considering an image as "anemic"
            var confidenceThreshold = 0.6;
        
            // Classify the image as "anemic" or "non-anemic" based on confidence level
            var classification;
            if (result >= confidenceThreshold) {
                classification = "<p style='color:red;'>You are Anemic";
            } else {
                classification = "You are Non-anemic";
            }
        
            // Display the classification result
			$('#output').html("<p style='color:brown;font-size:25px;padding:10px;margin-top:0px'>Anemia Test Completed<br>")
			// $('#output').append("Confindence is:",(result*100).toFixed(2),"%<br>")
			$('#output').append("<p style='font-size: 30px;padding:10px;'>Confidence is: " + (result * 100).toFixed(2) + "%<br></p>");

            $('#output').append(classification);

			
			
			$('#load').hide();
            $("#resultContainer").show();
            $('html').scrollTop(10000);
        });
	});
};

// var retrieveDefaultValuesFromLocalStorage = function() {
// 	try {
// 		var api_key = localStorage.getItem("rf.api_key");
// 		var model = localStorage.getItem("rf.model");
// 		var format = localStorage.getItem("rf.format");

// 		if (api_key) $('#api_key').val(api_key);
// 		if (model) $('#model').val(model);
// 		if (format) $('#format').val(format);
// 	} catch (e) {
// 		// localStorage disabled
// 	}

// 	$('#model').change(function() {
// 		localStorage.setItem('rf.model', $(this).val());
// 	});

// 	$('#api_key').change(function() {
// 		localStorage.setItem('rf.api_key', $(this).val());
// 	});

// 	$('#format').change(function() {
// 		localStorage.setItem('rf.format', $(this).val());
// 	});
// };

var setupButtonListeners = function() {
	// run inference when the form is submitted
	$('#inputForm').submit(function() {
		infer();
		return false;
	});

	// make the buttons blue when clicked
	// and show the proper "Select file" or "Enter url" state
	$('.bttn').click(function() {
		$(this).parent().find('.bttn').removeClass('active');
		$(this).addClass('active');

		if($('#computerButton').hasClass('active')) {
			$('#fileSelectionContainer').show();
			$('#urlContainer').hide();
		} else {
			$('#fileSelectionContainer').hide();
			$('#urlContainer').show();
		}

		if($('#jsonButton').hasClass('active')) {
			$('#imageOptions').hide();
		} else {
			$('#imageOptions').show();
		}

		return false;
	});

	// wire styled button to hidden file input
	$('#fileMock').click(function() {
		$('#file').click();
	});

	// grab the filename when a file is selected
	$("#file").change(function() {
		var path = $(this).val().replace(/\\/g, "/");
		var parts = path.split("/");
		var filename = parts.pop();
		$('#fileName').val(filename);
	});
};

var getSettingsFromForm = function(cb) {
	var settings = {
		method: "POST",
	};

	var parts = [
		"https://classify.roboflow.com/anemia-detection-yciqn/1?api_key=TYdlyjQygqI06Eledacx"
	];

	var method = $('#method .active').attr('data-value');
	if(method == "upload") {
		var file = $('#file').get(0).files && $('#file').get(0).files.item(0);
		if(!file) return alert("Please select a file.");

		getBase64fromFile(file).then(function(base64image) {
			settings.url = parts.join("");
			settings.data = base64image;

			console.log(settings);
			cb(settings);
		});
	} else {
		var url = $('#url').val();
		if(!url) return alert("Please enter an image URL");

		parts.push("&image=" + encodeURIComponent(url));

		settings.url = parts.join("");
		console.log(settings);
		cb(settings);
        
	}
};

var getBase64fromFile = function(file) {
	return new Promise(function(resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function() {
		resizeImage(reader.result).then(function(resizedImage){
			resolve(resizedImage);
		});
    };
		reader.onerror = function(error) {
			reject(error);
		};
	});
};

var resizeImage = function(base64Str) {
	return new Promise(function(resolve, reject) {
		var img = new Image();
		img.src = base64Str;
		img.onload = function(){
			var canvas = document.createElement("canvas");
			var MAX_WIDTH = 1500;
			var MAX_HEIGHT = 1500;
			var width = img.width;
			var height = img.height;
			if (width > height) {
				if (width > MAX_WIDTH) {
					height *= MAX_WIDTH / width;
					width = MAX_WIDTH;
				}
			} else {
				if (height > MAX_HEIGHT) {
					width *= MAX_HEIGHT / height;
					height = MAX_HEIGHT;
				}
			}
			canvas.width = width;
			canvas.height = height;
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, width, height);
			resolve(canvas.toDataURL('image/jpeg', 1.0));  
		};
	});	
};



// Function to update the test taken date and time
function updateTestTaken() {
    var currentDate = new Date();
    var dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
    
    var formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);
    var formattedTime = currentDate.toLocaleTimeString('en-US', timeOptions);
    
    var testDateElement = document.getElementById('testDate');
    testDateElement.innerHTML = "Date Taken : " + formattedDate +"<br><br>"+ "Time Taken " + formattedTime;
}

// Call the function to update the test taken date and time
updateTestTaken();

// Add event listener to the retake test button
$('#retakeButton').click(function() {
    // Reload the page
    location.reload();
});




