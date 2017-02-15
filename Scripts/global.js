var MAX_FILE_SIZE = 5000000;
var assetList = false;
var categoryList = false;
var ownerList = false;
var autocompleteList = false;

// Set toastr notification options
$(function () {
	toastr.options = {
		"closeButton": true,
		"debug": false,
		"newestOnTop": true,
		"progressBar": false,
		"positionClass": "toast-top-right",
		"preventDuplicates": true,
		"onclick": null,
		"showDuration": "300",
		"hideDuration": "1000",
		"timeOut": "7500",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	};
});

function get(url) {
	return new Promise(function(resolve, reject) {
		$.get(url, {}, function (res) {
			resolve(res);
		}).fail(function (error) {
			reject(error);
		});
	});
}

function getJSON(url) {
  return get(url).then(JSON.parse);
}

function post(url, data) {
	return new Promise(function(resolve, reject) {
		$.post(url, data, function (res) {
			resolve(res);
		}).fail(function (error) {
			reject(error);
		});
	});
}

function sendError(message) {
	$(".error").html(message);
	return new Promise(function(resolve, reject) {
		post("API/sendEmail.cshtml", {message: strip(message)}).then(function (res) {
			resolve(res);
		}).catch(function (error) {
			reject(error);
		});
	});
}

// Remove html tags from string
function strip(html) {
	var tmp = document.implementation.createHTMLDocument("New").body;
	tmp.innerHTML = html;
	return tmp.textContent || tmp.innerText || "";
}

// Display a notification message with bootstrap message types
function displayMessage(type, message) {
	toastr[type](message);
}

// Retrieve the GET variables from url
function getUrlVars() {
	var vars = {};
	var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
	});
	return vars;
}

function isInt(value) {
  return !isNaN(value) &&
		 parseInt(Number(value)) == value &&
		 !isNaN(parseInt(value, 10));
}

function pad(num, len) {
	num = '' + num;
	while (num.length < len) {
		num = '0' + num;
	}

	return num;
}

function getRandomID() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for (var i = 0; i < 8; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
}

function getAssets() {
	return new Promise(function (resolve, reject) {
		getJSON("API/getAllAssets.cshtml").then(function (assets) {
			getJSON("API/getAllImageDetails.cshtml").then(function (images) {
				var temp = {};
				assets.forEach(function (asset) {
					temp[asset.asset_id] = asset;
					asset.images = [];
					images.forEach(function (image) {
						if (image.asset_id === asset.asset_id) {
							asset.images.push(image);
						}
					});
				});

				assetList = temp;

				var promises = [];
				for (var asset_id in assetList) {
					var asset = assetList[asset_id];
					asset.images.forEach(function (image) {
						getImageData(image).then(function (updatedImage) {
							$(".thumbnail_container[data-asset-id=" + updatedImage.asset_id + "]").slick('slickAdd', "<div><img class='asset_thumbnail' src='" + updatedImage.image_data + "' alt='asset image' /></div>");

							var html = "";
							html += "<div class='asset_image_container' data-imageID='" + updatedImage.image_id + "'>";
							html += "    <img class='asset_image img-responsive' src='" + updatedImage.image_data + "' alt='asset image' />";
							html += "    <div>";
							html += "        <label>Description</label>";
							html += "        <input type='text' name='description' value='" + updatedImage.description + "' />";
							html += "    </div>";
							html += "    <div>";
							html += "        <label>Notes</label>";
							html += "        <input type='text' name='notes' value='" + updatedImage.notes + "' />";
							html += "    </div>";
							html += "    <div>";
							html += "        <button onclick='removeAssetImage(" + updatedImage.asset_id + ", " + updatedImage.image_id + ")'>Remove</button>";
							html += "    </div>";
							html += "</div>";
							$(".asset_images_container[data-asset-id=" + updatedImage.asset_id + "]").slick('slickAdd', html);
						}).catch(function (error) {
							sendError("getAssets() in global.js" + error.responseText).then(function (res) {
								displayMessage('error', 'There was a problem retrieving an image. Your web admin has been informed of the problem');
							}).catch(function (error) {
								displayMessage('error', 'There was a problem retrieving an image and there was also an error informing your web admin of the problem. You will need to inform them yourself.');
							});
						});
					});
				}

				resolve();
			}, function (error) {
				reject(error);
			});
		}, function (error) {
			reject(error);
		});
	});
}

function getCategories() {
	return new Promise(function (resolve, reject) {
		getJSON("API/getAllCategories.cshtml").then(function (categories) {
			categoryList = categories;
			resolve();
		}, function (error) {
			reject(error);
		});
	});
}

function getOwners() {
	return new Promise(function (resolve, reject) {
		getJSON("API/getAllOwners.cshtml").then(function (owners) {
			ownerList = owners;
			resolve();
		}, function (error) {
			reject(error);
		});
	});
}

function getImageData(image) {
	return new Promise(function (resolve, reject) {
		get("API/getImageData.cshtml?image_id=" + image.image_id).then(function (res) {
			image.image_data = res;
			resolve(image);
		}).catch(function (error) {
			reject(error);
		});
	});
}

function getAutocompleteValues() {
	return new Promise(function (resolve, reject) {
		getJSON("API/getAllAutocompleteValues.cshtml").then(function (autocomplete) {
			var obj = {};
			for (var field in autocomplete) {
				obj[field] = [];
				JSON.parse(autocomplete[field]).forEach(function (item) {
					if (item[field] && item[field] !== null && item[field] !== 'NULL') {
						obj[field].push(item[field]);
					}
				});
			}
			autocompleteList = obj;
			resolve();
		}, function (error) {
			reject(error);
		});
	});
}
