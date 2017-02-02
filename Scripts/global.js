var MAX_FILE_SIZE = 5000000;
var assetList = false;
var categoryList = false;
var ownerList = false;

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
			// displayMessage("error", "An error occurred while upload to the database. Please inform your web admin of this problem.");
			// $(".error").html(error.responseText);
		});
	});
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
							$(".asset_image_container[data-asset-id=" + updatedImage.asset_id + "]").slick('slickAdd', "<div><img class='asset_image img-responsive' src='" + updatedImage.image_data + "' alt='asset image' /></div>");
						}).catch(function (error) {
							$(".error").html(error.responseText);
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
