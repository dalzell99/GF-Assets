var imageTimers = [];
var deleteOwners = [];
var deleteCategories = [];
var currentPage = 1;

$(function () {
	if (!sessionStorage.pagination) { sessionStorage.pagination = 10; }

	$(window).on({
		hashchange: router
	});

	router();
});

function router() {
	stopImageTimers();
	$(".error").html('');

	switch(window.location.hash.substr(1)) {
		case '':
		case 'AssetTable':
			showAssetTable();
			break;
		case 'AddNew':
			showAddNewAsset();
			break;
		case 'Settings':
			showSettings();
			break;
		default:
			showAssetView(window.location.hash.substr(1));
	}
}

function changeAssetImage(asset_id, selector) {
	var i = assetList[asset_id].images;
	var newIndex = (parseInt($(selector).attr("data-index")) + 1) % i.length;

	var imageSrc = i[newIndex].image_data ? i[newIndex].image_data : "Images/placeholder.png";
	$(selector).attr("data-index", newIndex).attr("src", imageSrc);
}

function hideAllContainers() {
	$(".asset_table_page").hide();
	$(".asset_view_page").hide();
	$(".add_new_asset_page").hide();
	$(".settings_page").hide();
}

function stopImageTimers() {
	imageTimers.forEach(function (timer) {
		clearInterval(timer);
	});

	imageTimers = [];
}

function populateCategoryDropdown(category_id) {
	var html = "";
	categoryList.forEach(function (category) {
		html += "<option value='" + category.category_id + "'>" + category.category +"</option>";
	});
	$("select[name='category_id']").html(html).val(category_id || 1);
}

function populateOwnerDropdown(owner_id) {
	var html = "";
	ownerList.forEach(function (owner) {
		html += "<option value='" + owner.owner_id + "'>" + owner.name +"</option>";
	});
	$("select[name='owner_id']").html(html).val(owner_id || 1);
}

function populateAutocomplete() {
	['make', 'model', 'brand', 'goods_carried', 'route', 'home_base'].forEach(function (name) {
		$("input[name='" + name + "']").autocomplete({
			source: autocompleteList[name]
		});
	});
}

/* --------------------- Asset Table --------------------- */

function showAssetTable() {
	if (assetList) {
		generateAssetTable();
	} else {
		getAssets().then(function () {
			generateAssetTable();
		});
	}
}

function generateAssetTable() {
	var html = "";

	html +="<thead>";
	html +="    <tr>";
	html +="        <th class='sorttable_nosort'></th> ";
	html +="        <th>ID</th> ";
	html +="        <th class='sorttable_nosort'>Image</th> ";
	html +="        <th>Category</th> ";
	html +="        <th>Brand</th>";
	html +="        <th>Goods Carried</th>";
	html +="        <th>Home Base</th>";
	html +="        <th>Route</th>";
	html +="    </tr>";
	html +="</thead>";
	html +="<tbody>";
	for (var asset_id in assetList) {
		var asset = assetList[asset_id];
		html +="<tr> ";
		html +="    <td>";
		html +="        <div class='select_link' onclick='window.location.hash = " + asset.asset_id + ";'>Select</div>";
		html +="    </td>";
		html +="    <td>" + asset.asset_id + "</td>";
		html +="    <td class='thumbnail_container' data-asset-id='" + asset.asset_id + "'>";
		if (asset.images.length) {
			asset.images.forEach(function (image) {
				if (image.image_data) {
					html +="<div><img class='asset_thumbnail' src='" + image.image_data + "' alt='asset image' /></div>";
				}
			});
		}
		html += "   </td>";
		html +="    <td>" + asset.category + "</td>";
		html +="    <td>" + asset.brand + "</td>";
		html +="    <td>" + asset.goods_carried + "</td>";
		html +="    <td>" + asset.home_base + "</td>";
		html +="    <td>" + asset.route + "</td>";
		html +="</tr>";

		// if (asset.images.length > 0) {
		// 	imageTimers.push(setInterval(function (asset_id, selector) {
		// 		// changeAssetImage(asset_id, selector);
		// 	}, 5000, asset.asset_id, ".asset_thumbnail[data-asset-id='" + asset.asset_id + "']"));
		// }
	}

	html += "</tbody>";

	hideAllContainers();
	$(".asset_table").html(html);
	$(".asset_table_page").show();

	// Make table sortable
	sorttable.makeSortable($(".asset_table").get(0));
	$(".asset_table thead th:not(.sorttable_nosort)").click(changePage);

	changePage();

	$(".thumbnail_container").slick({
		autoplay: true,
		arrows: false
	});
}

function filterAssetTable() {
	var filter = $(".filter").val().toUpperCase();
	$(".asset_table tbody tr").each(function (index, row) {
		var cell = $(row).children('td:not(.thumbnail_container)');
		if (cell) {
			if (cell.text().toUpperCase().indexOf(filter) > -1) {
				$(row).removeClass('hidden');
			} else {
				$(row).addClass('hidden');
			}
		}
	});

	changePage();
}

function changePagination(val) {
	currentPage = 1;
	sessionStorage.pagination = val;
	changePage();
}

function nextPage() {
	currentPage += 1;
	changePage();
}

function previousPage() {
	currentPage -= 1;
	changePage();
}

function changePage() {
	$(".pageNumber").text(currentPage);
	var p = sessionStorage.pagination || 10;

	if (p !== "Infinity") {
		var lowerLimit = (currentPage - 1) * p;
		var upperLimit = currentPage * p - 1;

		$(".asset_table tbody tr:not(.hidden)").each(function (index, elem) {
			if (index >= lowerLimit && index <= upperLimit) {
				$(elem).show();
			} else {
				$(elem).hide();
			}
		});
		$(".pagination_controls").show();

		if (Math.ceil($(".asset_table tbody tr:not(.hidden)").length / p) <= currentPage) {
			$(".previousPage").show();
			$(".nextPage").hide();
		} else if (currentPage === 1) {
			$(".previousPage").hide();
			$(".nextPage").show();
		} else {
			$(".previousPage").show();
			$(".nextPage").show();
		}
	} else {
		$(".asset_table tbody tr").show();
		$(".pagination_controls").hide();
	}
}

/* --------------------- Asset View --------------------- */

function showAssetView(asset_id) {
	if (assetList) {
		generateAssetView(asset_id);
	} else {
		getAssets().then(function () {
			generateAssetView(asset_id);
		});
	}
}

function generateAssetView(asset_id) {
	var asset = assetList[asset_id];

	var html = "";
	html += "<div>";
	html += "    <div class='col-sm-6'>";
	html += "        <div>";
	html += "            <label>Owner Name</label>";
	html += "            <select name='owner_id'></select>";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Rego</label>";
	html += "            <input type='text' name='rego' value='" + asset.rego + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Make</label>";
	html += "            <input type='text' name='make' value='" + asset.make + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Model</label>";
	html += "            <input type='text' name='model' value='" + asset.model + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Year</label>";
	html += "            <input type='number' name='year' value='" + asset.year + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Brand</label>";
	html += "            <input type='text' name='brand' value='" + asset.brand + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Category</label>";
	html += "            <select name='category_id'></select>";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Goods Carried</label>";
	html += "            <input type='text' name='goods_carried' value='" + asset.goods_carried + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Home Base</label>";
	html += "            <input type='text' name='home_base' value='" + asset.home_base + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Route</label>";
	html += "            <input type='text' name='route' value='" + asset.route + "' />";
	html += "        </div>";
	html += "        <div>";
	html += "            <button onclick='updateAsset(" + asset.asset_id + ")'>Save</button>";
	html += "        </div>";
	html += "    </div>";
	html += "    <div class='col-sm-6'>";
	html += "        <div class='asset_images_container' data-asset-id='" + asset.asset_id + "'>";
	if (asset.images.length) {
		asset.images.forEach(function (image) {
			if (image.image_data) {
				html += "<div class='asset_image_container' data-imageID='" + image.image_id + "'>";
				html += "    <img class='asset_image img-responsive' src='" + image.image_data + "' alt='asset image' />";
				html += "    <div>";
				html += "        <label>Description</label>";
				html += "        <input type='text' name='description' value='" + image.description + "' />";
				html += "    </div>";
				html += "    <div>";
				html += "        <label>Notes</label>";
				html += "        <input type='text' name='notes' value='" + image.notes + "' />";
				html += "    </div>";
				html += "    <div>";
				html += "        <button onclick='removeAssetImage(" + asset.asset_id + ", " + image.image_id + ")'>Remove</button>";
				html += "    </div>";
				html += "</div>";
			}
		});
	}
	html += "        </div>";
	html += "        <div>";
	html += "            <label>Image (5Mb limit):</label>";
	html += "            <input type='file' id='viewAssetFile' multiple />";
	html += "            <button onclick='uploadImageFromAssetView(" + asset.asset_id + ")'>Add Image</button>";
	html += "        </div>";
	html += "    </div>";
	html += "<div>";


	hideAllContainers();
	$(".asset_view_page").html(html).show();

	$(".asset_images_container").slick({
		autoplay: false,
		dots: true,
		arrows: false
	});

	if (categoryList) {
		populateCategoryDropdown(asset.category_id);
	} else {
		getCategories().then(function () {
			populateCategoryDropdown(asset.category_id);
		});
	}

	if (ownerList) {
		populateOwnerDropdown(asset.owner_id);
	} else {
		getOwners().then(function () {
			populateOwnerDropdown(asset.owner_id);
		});
	}


	if (autocompleteList) {
		populateAutocomplete();
	} else {
		getAutocompleteValues().then(function () {
			populateAutocomplete();
		});
	}
}

function updateAsset(asset_id) {
	var data = {
		asset_id: asset_id
	};
	var fields = $(".asset_view_page input, .asset_view_page select");
	fields.each(function (index, field) {
		data[field.name] = field.value === "" ? null : field.value;
	});

	var images = [];
	$(".asset_view_page .asset_image_container:not(.slick-cloned)").each(function (index, elem) {
		var image_id = $(elem).attr('data-imageID');
		var imageDetails = assetList[asset_id].images.filter(function (image) {
			return image_id == image.image_id;
		})[0];
		imageDetails.description = $(elem).find("[name='description']").val();
		imageDetails.notes = $(elem).find("[name='notes']").val();
		images.push(imageDetails);
	});
	data.images = JSON.stringify(images);

	post("API/updateAsset.cshtml", data).then(function () {
		displayMessage("success", "Asset has been updated.");
	}).catch(function (error) {
		displayMessage('error', 'There was an error updating the asset.');
		sendError("<h1>updateAsset() in default.js</h1>" + error.responseText).then(function (res) {
			displayMessage('success', 'Your web admin has been informed of the problem');
		}).catch(function (error) {
			displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
		});
	});

	data.images = images;
	assetList[asset_id] = data;
}

function removeAssetImage(asset_id, image_id) {
	post("API/deleteImage.cshtml", {asset_id: asset_id, image_id: image_id}).then(function () {
		displayMessage('success', 'The image has been deleted');

		var index = $(".asset_image_container[data-imageID='" + image_id + "']:not(.slick-cloned)").attr('data-slick-index');
		$(".asset_images_container").slick('slickRemove', index);
	}).catch(function (error) {
		displayMessage('error', 'There was a problem deleting the image');
		sendError("<h1>removeAssetImage() in default.js</h1>" + error.responseText).then(function (res) {
			displayMessage('success', 'Your web admin has been informed of the problem');
		}).catch(function (error) {
			displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
		});
	});
}

function uploadImageFromAssetView(asset_id) {
	var files = document.querySelector('#viewAssetFile').files;
	var promises = [];
	for (var i = 0; i < files.length; i++) {
		if (files[i].size > MAX_FILE_SIZE) {
			displayMessage("warning", "Max file size is " + (MAX_FILE_SIZE / 1000) + " kilobytes.<br />" + files[i].name + " is " + parseInt(files[i].size / 1000) + " kilobytes.");
		} else {
			promises.push(uploadImage(files[i], asset_id));
		}
	}

	Promise.all(promises).then(function () {
		location.reload();
	}).catch(function (error) {
		displayMessage('error', 'There was an error uploading the images');
		sendError("<h1>uploadImageFromAssetView() in default.js</h1>" + error.responseText).then(function (res) {
			displayMessage('success', 'Your web admin has been informed of the problem');
		}).catch(function (error) {
			displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
		});
	});
}

/* --------------------- New Asset Page --------------------- */

function showAddNewAsset() {
	hideAllContainers();
	$(".add_new_asset_page").show();
	if (categoryList) {
		populateCategoryDropdown();
	} else {
		getCategories().then(function () {
			populateCategoryDropdown();
		});
	}

	if (ownerList) {
		populateOwnerDropdown();
	} else {
		getOwners().then(function () {
			populateOwnerDropdown();
		});
	}

	if (autocompleteList) {
		populateAutocomplete();
	} else {
		getAutocompleteValues().then(function () {
			populateAutocomplete();
		});
	}

	$(".new_asset_image_container").slick({
		autoplay: false,
		dots: true,
		arrows: true,
		centerMode: true
	});

	$('#file').change(function () {
		$(".new_asset_image_container").slick('unslick').slick({
			autoplay: false,
			dots: true,
			arrows: true,
			centerMode: true
		});

		var files = document.querySelector('#file').files;
		for (var i = 0; i < files.length; i++) {
			if (files[i].size > MAX_FILE_SIZE) {
				displayMessage("warning", "Max file size is " + (MAX_FILE_SIZE / 1000) + " kilobytes.<br />" + files[i].name + " is " + parseInt(files[i].size / 1000) + " kilobytes.");
			} else {
				getDataURI(files[i], i).then(function (image) {
					var html = "";
					html += "<div data-image-index='" + image.index + "'>";
					html += "    <img class='new_asset_image img-responsive' src='" + image.image_data + "' alt='asset image' />";
					html += "    <div>";
					html += "        <label>Description</label>";
					html += "        <input type='text' name='description' />";
					html += "    </div>";
					html += "    <div>";
					html += "        <label>Notes</label>";
					html += "        <input type='text' name='notes' />";
					html += "    </div>";
					html += "</div>";
					$(".new_asset_image_container").slick('slickAdd', html);
				}).catch(function (error) {
					sendError("<h1>showAddNewAsset() in default.js</h1>" + error.responseText).then(function (res) {
						displayMessage('error', 'There was a problem displaying the uploaded image. Your web admin has been informed of the problem');
					}).catch(function (error) {
						displayMessage('error', 'There was a problem displaying the uploaded image and there was also an error informing your web admin of the problem. You will need to inform them yourself.');
					});
				});
			}
		}
	});
}

function submitForm() {
	var error = false;
	var data = {};

	var fields = $(".addNewAssetForm input:not([type='file']), .addNewAssetForm select");
	fields.each(function (index, field) {
		data[field.name] = field.value === "" ? null : field.value;
	});

	var files = document.querySelector('#file').files;
	for (var i = 0; i < files.length; i++) {
		if (files[i].size > MAX_FILE_SIZE) {
			displayMessage("warning", "Max file size is " + (MAX_FILE_SIZE / 1000) + " kilobytes.<br />" + files[i].name + " is " + parseInt(files[i].size / 1000) + " kilobytes.");
			error = true;
		}
	}

	if (!error) {
		post("API/addNewAsset.cshtml", data).then(function (asset_id) {
			if (files.length) {
				displayMessage("success", "Asset has been added. Images are now being uploaded");

				var promises = [];
				for (var i = 0; i < files.length; i++) {
					promises.push(uploadImage(files[i], parseInt(asset_id), i)); /* parseInt removes the return character added to the end of asset_id. Why it's there I don't know */
				}

				Promise.all(promises).then(function () {
					displayMessage("success", "Images have been uploaded");
					$(".addNewAssetForm input").val('');
					$(".new_asset_image_container").slick('unslick').slick({
						autoplay: false,
						dots: true,
						arrows: true,
						centerMode: true
					});
				}).catch(function (error) {
					displayMessage('error', 'There was an error uploading the images');
					sendError("<h1>submitForm() in default.js</h1>" + error.responseText).then(function (res) {
						displayMessage('success', 'Your web admin has been informed of the problem');
					}).catch(function (error) {
						displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
					});
				});
			} else {
				displayMessage("success", "Asset has been added.");
			}
		}).catch(function (error) {
			displayMessage('error', 'There was an error adding the new asset.');
			sendError("<h1>submitForm() in default.js</h1>" + error.responseText).then(function (res) {
				displayMessage('success', 'Your web admin has been informed of the problem');
			}).catch(function (error) {
				displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
			});
		});
	}
}

function uploadImage(file, asset_id, index) {
	return new Promise(function (resolve, reject) {
		getDataURI(file).then(function (image) {
			image.asset_id = asset_id;
			image.description = index ? $("[data-image-index='" + index + "']:not(.slick-cloned) [name='description']").val() : null;
			image.notes = index ? $("[data-image-index='" + index + "']:not(.slick-cloned) [name='notes']").val() : null;
			return post("API/uploadImage.cshtml", image).then(function () {
				resolve();
			}).catch(function (error) {
				reject(error);
			});
		}).catch(function (error) {
			reject(error);
		});
	});
}

function getDataURI(file, index) {
	return new Promise(function (resolve, reject) {
		var reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = function () {
			resolve({
				name: file.name,
				size: file.size,
				image_data: reader.result,
				index: index
			});
		};
		reader.onerror = function (error) {
			reject(error);
		};
	});
}

/* --------------------- Settings Page --------------------- */

function showSettings() {
	hideAllContainers();
	$(".settings_page").show();

	if (categoryList) {
		generateCategoryEdit();
	} else {
		getCategories().then(function () {
			generateCategoryEdit();
		});
	}

	if (ownerList) {
		generateOwnerEdit();
	} else {
		getOwners().then(function () {
			generateOwnerEdit();
		});
	}
}

function generateCategoryEdit() {
	var html = "";

	html += "<form>";
	html += "<fieldset>";
	html += "<legend>Categories</legend>";
	html += "<table class='categoryList'>";
	html += "    <tr>";
	html += "        <th>Category</th>";
	html += "        <th></th>";
	html += "    </tr>";
	categoryList.forEach(function (category) {
		html += "<tr data-category='" + category.category_id + "'>";
		html += "    <td><input type='text' name='category' value='" + category.category + "' /></td>";
		html += "    <td><i class='fa fa-times removeCategoryButton' aria-hidden='true' onclick='removeCategory(" + category.category_id + ")'></i></td>";
		html += "</tr>";
	});

	html += "    <tr class='addCategoryContainer'>";
	html += "        <td><input type='text' name='newCategory' /></td>";
	html += "        <td><i class='fa fa-plus addCategoryButton' aria-hidden='true' onclick='addCategory()'></i></td>";
	html += "    </tr>";
	html += "</table>";
	html += "<div>";
	html += "    <button type='button' class='saveCategoryButton' onclick='saveCategories()'>Save Categories</button>";
	html += "</div>";
	html += "</fieldset>";
	html += "</form>";

	$(".settings_page .categoryListContainer").html(html);
}

function addCategory() {
	var tempID = Math.round(Math.random() * 1000000000) * -1;
	var selector = $(".settings_page .addCategoryContainer");
	var html = "";
	html += "<tr data-category='" + tempID + "'>";
	html += "    <td><input type='text' name='category' value='" + selector.find("input[name='newCategory']").val() + "' /></td>";
	html += "    <td><i class='fa fa-times removeCategoryButton' aria-hidden='true' onclick='removeCategory(" + tempID + ")'></i></td>";
	html += "</tr>";
	$(".settings_page .categoryList .addCategoryContainer").before(html);
	selector.find('input').val('');
}

function removeCategory(category) {
	$(".settings_page [data-category='" + category + "']").remove();
	deleteCategories.push(category);
}

function saveCategories() {
	var obj = {
		update: [],
		new: [],
		delete: deleteCategories
	};
	$(".settings_page .categoryList tr:not(:first):not(.addCategoryContainer)").each(function (index, row) {
		var temp = {
			category_id: $(row).attr('data-category')
		};

		$(row).find('input').each(function (index, input) {
			temp[input.name] = input.value;
		});

		obj[temp.category_id >= 0 ? 'update' : 'new'].push(temp);
	});

	obj.update = JSON.stringify(obj.update);
	obj.new = JSON.stringify(obj.new);
	obj.delete = JSON.stringify(obj.delete);

	post("API/updateCategories.cshtml", obj).then(JSON.parse).then(function (res) {
		displayMessage("success", "Categories updated");
		for (var currentID in res) {
			$(".settings_page [data-category='" + currentID + "'] i").removeAttr('onclick').on('click', function () {
				removeCategory(res[currentID]);
			});

			$(".settings_page [data-category='" + currentID + "']").attr('data-category', res[currentID]);
		}
		getCategories();
	}).catch(function (error) {
		displayMessage("error", "Error updating categories");
		sendError("<h1>saveCategories() in default.js</h1>" + error.responseText).then(function (res) {
			displayMessage('success', 'Your web admin has been informed of the problem');
		}).catch(function (error) {
			displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
		});
	});
}

function generateOwnerEdit() {
	var html = "";

	html += "<form>";
	html += "<fieldset>";
	html += "<legend>Owners</legend>";
	html += "<table class='ownerList'>";
	html += "    <tr>";
	html += "        <th>Name</th>";
	html += "        <th>Address 1</th>";
	html += "        <th>Address 2</th>";
	html += "        <th>City</th>";
	html += "        <th></th>";
	html += "    </tr>";
	ownerList.forEach(function (owner) {
		html += "<tr data-owner='" + owner.owner_id + "'>";
		html += "    <td><input type='text' name='name' value='" + owner.name + "' /></td>";
		html += "    <td><input type='text' name='address1' value='" + owner.address1 + "' /></td>";
		html += "    <td><input type='text' name='address2' value='" + owner.address2 + "' /></td>";
		html += "    <td><input type='text' name='city' value='" + owner.city + "' /></td>";
		html += "    <td><i class='fa fa-times removeOwnerButton' aria-hidden='true' onclick='removeOwner(" + owner.owner_id + ")'></i></td>";
		html += "</tr>";
	});
	html += "    <tr class='addOwnerContainer'>";
	html += "        <td><input type='text' name='newName' /></td>";
	html += "        <td><input type='text' name='newAddress1' /></td>";
	html += "        <td><input type='text' name='newAddress2' /></td>";
	html += "        <td><input type='text' name='newCity' /></td>";
	html += "        <td><i class='fa fa-plus addOwnerButton' aria-hidden='true' onclick='addOwner()'></i></td>";
	html += "    </tr>";
	html += "</table>";
	html += "<div>";
	html += "    <button type='button' class='saveOwnerButton' onclick='saveOwners()'>Save Owners</button>";
	html += "</div>";
	html += "</fieldset>";
	html += "</form>";

	$(".settings_page .ownerListContainer").html(html);
}

function addOwner() {
	var tempID = Math.round(Math.random() * 1000000000) * -1;
	var selector = $(".settings_page .addOwnerContainer");
	var html = "";
	html += "<tr data-owner='" + tempID + "'>";
	html += "    <td><input type='text' name='name' value='" + selector.find("input[name='newName']").val() + "' /></td>";
	html += "    <td><input type='text' name='address1' value='" + selector.find("input[name='newAddress1']").val() + "' /></td>";
	html += "    <td><input type='text' name='address2' value='" + selector.find("input[name='newAddress2']").val() + "' /></td>";
	html += "    <td><input type='text' name='city' value='" + selector.find("input[name='newCity']").val() + "' /></td>";
	html += "    <td><i class='fa fa-times removeOwnerButton' aria-hidden='true' onclick='removeOwner(" + tempID + ")'></i></td>";
	html += "</tr>";
	$(".settings_page .ownerList .addOwnerContainer").before(html);
	selector.find('input').val('');
}

function removeOwner(owner) {
	$(".settings_page [data-owner='" + owner + "']").remove();
	deleteOwners.push(owner);
}

function saveOwners() {
	var obj = {
		update: [],
		new: [],
		delete: deleteOwners
	};
	$(".settings_page .ownerList tr:not(:first):not(.addOwnerContainer)").each(function (index, row) {
		var temp = {
			owner_id: $(row).attr('data-owner')
		};

		$(row).find('input').each(function (index, input) {
			temp[input.name] = input.value;
		});

		obj[temp.owner_id >= 0 ? 'update' : 'new'].push(temp);
	});

	obj.update = JSON.stringify(obj.update);
	obj.new = JSON.stringify(obj.new);
	obj.delete = JSON.stringify(obj.delete);

	post("API/updateOwners.cshtml", obj).then(JSON.parse).then(function (res) {
		displayMessage("success", "Owners updated");

		for (var currentID in res) {
			$(".settings_page [data-owner='" + currentID + "'] i").removeAttr('onclick').on('click', function () {
				removeOwner(res[currentID]);
			});

			$(".settings_page [data-owner='" + currentID + "']").attr('data-owner', res[currentID]);
		}
		getOwners();
	}).catch(function (error) {
		displayMessage("error", "Error updating owners");
		sendError("<h1>saveOwners() in default.js</h1>" + error.responseText).then(function (res) {
			displayMessage('success', 'Your web admin has been informed of the problem');
		}).catch(function (error) {
			displayMessage('error', 'There was an error informing your web admin of the problem. You will need to inform them yourself.');
		});
	});
}
